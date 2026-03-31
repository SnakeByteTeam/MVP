import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { GroqClient } from './groq.client';
import { GroqSuggestionResultDto } from '../dtos/groq-suggestion-result.dto';
import { GetSuggestionCmd } from 'src/analytics/application/commands/get-suggestion.cmd';

interface GroqApiResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

type Season = 'Winter' | 'Spring' | 'Summer' | 'Autumn';

const SEASON_LABELS: Record<number, Season> = {
  1: 'Winter',
  2: 'Winter',
  12: 'Winter',
  3: 'Spring',
  4: 'Spring',
  5: 'Spring',
  6: 'Summer',
  7: 'Summer',
  8: 'Summer',
  9: 'Autumn',
  10: 'Autumn',
  11: 'Autumn',
};

const METRIC_LABELS: Record<string, string> = {
  'plant-consumption': 'daily energy consumption of the plant lights',
  'thermostat-temperature': 'temperature detected by the plant thermostat',
  'sensor-presence': 'presence detection events per sensor',
  'sensor-long-presence': 'prolonged presence events (>30 min) per sensor',
};

const EMPTY_SUGGESTION: GroqSuggestionResultDto = {
  message: '',
  isSuggestion: false,
};

@Injectable()
export class GroqClientImpl implements GroqClient {
  private readonly logger = new Logger(GroqClientImpl.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly model = 'llama-3.3-70b-versatile';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
  }

  async generateSuggestion(
    current: GetSuggestionCmd,
    baseline: GetSuggestionCmd,
  ): Promise<GroqSuggestionResultDto> {
    const hasSeries =
      current.series.length > 0 &&
      current.series.some((s) => s.getData().length > 0);

    if (!hasSeries) {
      return EMPTY_SUGGESTION;
    }

    const prompt = this.buildPrompt(current, baseline);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert energy data analyst for smart building management systems. Always respond in Italian, in a professional and concise manner. Always respond with a valid JSON object only, no markdown, no extra text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Groq API error: ${error}`);

      if (response.status === 429) {
        this.logger.warn(
          'Groq rate limit exceeded — returning empty suggestion',
        );
        return EMPTY_SUGGESTION;
      }

      throw new HttpException(
        'An error occurred while generating the suggestion.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const body = (await response.json()) as GroqApiResponse;
    const text = body.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Groq returned an empty response');
    }

    try {
      const parsed = JSON.parse(text) as GroqSuggestionResultDto;
      if (
        typeof parsed.message !== 'string' ||
        typeof parsed.isSuggestion !== 'boolean'
      ) {
        throw new Error('Invalid JSON structure');
      }
      return parsed;
    } catch {
      this.logger.error(`Groq returned invalid JSON: ${text}`);
      throw new Error('Groq returned an invalid JSON response');
    }
  }

  // ---------------------------------------------------------------------------
  // PROMPT BUILDER
  // ---------------------------------------------------------------------------

  private buildPrompt(
    current: GetSuggestionCmd,
    baseline: GetSuggestionCmd,
  ): string {
    const month = new Date().getMonth() + 1;
    const season: Season = SEASON_LABELS[month];
    const description = METRIC_LABELS[current.metric] ?? current.metric;
    const hasSeries = current.series.length > 0;

    const statisticsSection = hasSeries
      ? this.buildSeriesStatistics(current, baseline)
      : this.buildScalarStatistics(current, baseline);

    return `
You are analyzing plant monitoring data for non-technical staff (nurses, healthcare assistants).

## Context
- Season: ${season}
- Metric: ${current.metric}
- Description: ${description}
- Unit: ${current.unit}
- Period: ${current.labels[0]} → ${current.labels[current.labels.length - 1]}

## Statistical summary
${statisticsSection}

## Instructions
${hasSeries ? this.buildSeriesInstructions() : this.buildScalarInstructions()}

## Response format
Respond ONLY with a valid JSON object, no markdown, no extra text:
{"message": "<action or No action required.>", "isSuggestion": <true|false>}
Message content must be in Italian.
    `.trim();
  }

  // ---------------------------------------------------------------------------
  // SCALAR STATISTICS (plant-consumption, thermostat-temperature)
  // ---------------------------------------------------------------------------

  private buildScalarStatistics(
    current: GetSuggestionCmd,
    baseline: GetSuggestionCmd,
  ): string {
    const currAvg = this.averageFromLabels(current);
    const baseAvg = this.averageFromLabels(baseline);
    const dev = this.deviationBetween(currAvg, baseAvg);

    return `
- Current period average: ${currAvg.toFixed(2)} ${current.unit}
- Baseline period average: ${baseAvg.toFixed(2)} ${current.unit}
- Deviation from baseline: ${dev}%
    `.trim();
  }

  private buildScalarInstructions(): string {
    return `
- If deviation is below +15%: set "isSuggestion" to false and "message" to "No action required."
- If deviation is above +15%: set "isSuggestion" to true and write a direct action in "message" to reduce usage.
- Actions must be concrete (e.g. "Turn off the lights from 9:00 PM to 6:00 AM." or "Set the thermostat to 20°C during the night.").
- Do NOT mention device names.
- Do NOT explain the problem. Only state the action.
- Message must be maximum 2 sentences long.
- Tone: formal, direct, imperative.
    `.trim();
  }

  // ---------------------------------------------------------------------------
  // SERIES STATISTICS (sensor-presence, sensor-long-presence)
  // ---------------------------------------------------------------------------

  private buildSeriesStatistics(
    current: GetSuggestionCmd,
    baseline: GetSuggestionCmd,
  ): string {
    const lines: string[] = [];

    for (const currSeries of current.series) {
      const baselineSeries = baseline.series.find(
        (s) => s.getId() === currSeries.getId(),
      );

      const currAvg = this.averageFromData(currSeries.getData());
      const baseAvg = baselineSeries
        ? this.averageFromData(baselineSeries.getData())
        : 0;
      const dev = this.deviationBetween(currAvg, baseAvg);

      lines.push(
        `- Sensor "${currSeries.getName()}": avg ${currAvg.toFixed(2)} ${current.unit} (baseline: ${baseAvg.toFixed(2)}, deviation: ${dev}%)`,
      );
    }

    return lines.join('\n');
  }

  private buildSeriesInstructions(): string {
    return `
- Analyze each sensor individually.
- If any sensor shows deviation above +30% from baseline: set "isSuggestion" to true and mention the specific sensor location in "message".
- If all sensors are within normal range: set "isSuggestion" to false and "message" to "No action required."
- Actions must be concrete and refer to the specific location (e.g. "Verificare la presenza prolungata nel bagno.").
- Do NOT explain the problem. Only state the action.
- Message must be maximum 2 sentences long.
- Tone: formal, direct, imperative.
    `.trim();
  }

  private averageFromLabels(cmd: GetSuggestionCmd): number {
    const values = cmd.labels
      .map((_, i) => parseFloat(cmd.series[0]?.getData()[i]?.toString() ?? '0'))
      .filter((v) => !isNaN(v));
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private averageFromData(data: number[]): number {
    if (data.length === 0) return 0;
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  private deviationBetween(current: number, baseline: number): string {
    if (baseline === 0) return '0.0';
    return (((current - baseline) / baseline) * 100).toFixed(1);
  }
}
