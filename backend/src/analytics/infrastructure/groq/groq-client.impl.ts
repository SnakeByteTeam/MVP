import { Injectable, Logger } from '@nestjs/common';
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
};

const EMPTY_SUGGESTION: GroqSuggestionResultDto = {
  message: [],
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
    const SUPPORTED_METRICS = Object.keys(METRIC_LABELS);

    if (!SUPPORTED_METRICS.includes(current.metric)) {
      return EMPTY_SUGGESTION;
    }
    const hasSeries = current.series.some((s) => s.getData().length > 0);

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

      if (response.status === 429) {
        this.logger.warn('Groq rate limit exceeded');
        return EMPTY_SUGGESTION;
      }

      this.logger.error(`Groq API error: ${error}`);
      return EMPTY_SUGGESTION;
    }

    const body = (await response.json()) as GroqApiResponse;
    const text = body.choices?.[0]?.message?.content;

    if (!text) {
      this.logger.error('Groq returned empty response');
      return EMPTY_SUGGESTION;
    }

    try {
      const parsed = JSON.parse(text) as GroqSuggestionResultDto;
      if (
        !Array.isArray(parsed.message) ||
        !parsed.message.every((m) => typeof m === 'string') ||
        typeof parsed.isSuggestion !== 'boolean'
      ) {
        this.logger.error(`Invalid JSON structure: ${text}`);
        return EMPTY_SUGGESTION;
      }
      return parsed;
    } catch (err) {
      this.logger.error(
        'Unexpected Groq error',
        err instanceof Error ? err.stack : String(err),
      );
    }
    return EMPTY_SUGGESTION;
  }

  private buildPrompt(
    current: GetSuggestionCmd,
    baseline: GetSuggestionCmd,
  ): string {
    const month = new Date().getMonth() + 1;
    const season: Season = SEASON_LABELS[month];
    const description = METRIC_LABELS[current.metric] ?? current.metric;

    const isScalar = current.metric in METRIC_LABELS;

    const statisticsSection = isScalar
      ? this.buildScalarStatistics(current, baseline)
      : this.buildSeriesStatistics(current, baseline);

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
${isScalar ? this.buildScalarInstructions(current.metric) : this.buildSeriesInstructions()}

## Response format
Respond ONLY with a valid JSON object, no markdown, no extra text:
{"message": ["<action 1>", "<action 2>"], "isSuggestion": <true|false>}
- If no action is required: "message" must an empty array [] and "isSuggestion" must be false.
- If action is required: "message" must contain al least 2 concrete actions in Italian.
  `.trim();
  }

  private buildScalarStatistics(
    current: GetSuggestionCmd,
    baseline: GetSuggestionCmd,
  ): string {
    const currValues = current.series[0]?.getData() ?? [];
    const currAvg = this.averageFromLabels(current);

    if (current.metric === 'thermostat-temperature') {
      const { min, max } = this.rangeFromBaseline(baseline);
      return `
- Current period values: ${currValues.join(', ')} ${current.unit}
- Current period average: ${currAvg.toFixed(2)} ${current.unit}
- Acceptable range (from baseline): ${min.toFixed(2)} – ${max.toFixed(2)} ${current.unit}
    `.trim();
    }

    const baseAvg = this.averageFromLabels(baseline);
    const dev = this.deviationBetween(currAvg, baseAvg);

    return `
- Current period values: ${currValues.join(', ')} ${current.unit}
- Current period average: ${currAvg.toFixed(2)} ${current.unit}
- Baseline period average: ${baseAvg.toFixed(2)} ${current.unit}
- Deviation from baseline: ${dev}%
  `.trim();
  }

  private buildScalarInstructions(metric: string): string {
    if (metric === 'thermostat-temperature') {
      return `
- The acceptable range is provided in the statistical summary above.
- If the current average is within the acceptable range: set "isSuggestion" to false and "message" to "Nessun intervento necessario."
- If the current average is above the maximum: set "isSuggestion" to true and suggest lowering the temperature to stay within range.
- If the current average is below the minimum: set "isSuggestion" to true and suggest raising the temperature (cold is dangerous for elderly residents).
- Actions must be concrete (e.g. "Impostare il termostato a 20°C.").
- Do NOT mention device names. Only state the action.
- Do NOT suggest checking the heating system.
- Tone: formal, direct, imperative.
    `.trim();
    }

    return `
- If deviation from baseline is below +15%: set "isSuggestion" to false and "message" to "Nessun intervento necessario."
- If current average is 0 or very close to 0: set "isSuggestion" to false and "message" to "Nessun intervento necessario."
- If deviation is above +15%: set "isSuggestion" to true and write a direct action to reduce consumption.
- Actions must be concrete and must refer to concrete hours (e.g. "Spegnere le luci dalle 21:00 alle 06:00.").
- Do NOT mention device names. Only state the action.
- Do NOT suggest checking the lightning system.
- Tone: formal, direct, imperative.
  `.trim();
  }

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

  private rangeFromBaseline(baseline: GetSuggestionCmd): {
    min: number;
    max: number;
  } {
    const data = baseline.series[0]?.getData() ?? [];
    const values = data.filter(
      (v) => typeof v === 'number' && !Number.isNaN(v) && Number.isFinite(v),
    );
    if (values.length === 0) return { min: 0, max: 0 };
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  private averageFromLabels(cmd: GetSuggestionCmd): number {
    const data = cmd.series[0]?.getData() ?? [];
    const values = data.filter(
      (v) => typeof v === 'number' && !Number.isNaN(v) && Number.isFinite(v),
    );
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
