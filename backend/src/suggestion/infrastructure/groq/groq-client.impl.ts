import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { GetSuggestionCmd } from 'src/suggestion/application/commands/get-suggestion.cmd';
import { GroqClient } from './groq.client';
import { GroqSuggestionResult } from '../dtos/groq-suggestion-result.dto';

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

const METRIC_LABELS: Record<string, { unit: string; description: string }> = {
  'plant-consumption': {
    unit: 'Wh',
    description: 'daily energy consumption of the plant lights',
  },
  'thermostat-temperature': {
    unit: '°C',
    description: 'temperature detected by the plant thermostat',
  },
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
  ): Promise<GroqSuggestionResult> {
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
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Groq API error: ${error}`);

      if (response.status === 429) {
        throw new HttpException(
          'The analysis service is temporarily unavailable. Please try again in a few minutes.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
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
      const parsed = JSON.parse(text) as GroqSuggestionResult;
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
    const metricInfo = METRIC_LABELS[current.metric] ?? {
      unit: '',
      description: current.metric,
    };
    const deviation = this.deviation(current, baseline);

    return `
You are analyzing plant monitoring data for non-technical staff (nurses, healthcare assistants).

## Context
- Season: ${season}
- Metric: ${current.metric}
- Description: ${metricInfo.description}
- Unit: ${metricInfo.unit}

## Statistical summary
- Current period average: ${this.average(current)} ${metricInfo.unit}
- Baseline period average: ${this.average(baseline)} ${metricInfo.unit}
- Deviation from baseline: ${deviation}%

## Instructions
- If deviation is below +15%: set "isSuggestion" to false and "message" to "No action required."
- If deviation is above +15%: set "isSuggestion" to true and write a direct action in "message" to reduce usage.
- Actions must be concrete (e.g. "Turn off the lights from 9:00 PM to 6:00 AM." or "Set the thermostat to 20°C during the night.").
- Do NOT mention device names.
- Do NOT explain the problem. Only state the action.
- Message must be maximum 2 sentences long.
- Tone: formal, direct, imperative.

## Response format
Respond ONLY with a valid JSON object, no markdown, no extra text:
{"message": "<action or No action required.>", "isSuggestion": <true|false>}
Message content must be in Italian.
    `.trim();
  }

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  private average(cmd: GetSuggestionCmd): string {
    const values = cmd.data.map((v) => parseFloat(v)).filter((v) => !isNaN(v));
    if (values.length === 0) return '0.00';
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(2);
  }

  private deviation(
    current: GetSuggestionCmd,
    baseline: GetSuggestionCmd,
  ): string {
    const curr = parseFloat(this.average(current));
    const base = parseFloat(this.average(baseline));
    if (base === 0) return '0.0';
    return (((curr - base) / base) * 100).toFixed(1);
  }
}
