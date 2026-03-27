import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetSuggestionCmd } from 'src/suggestion/application/commands/get-suggestion.cmd';
import { GroqClient } from './groq.client';

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

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('GROQ_API_KEY');
  }

  async generateSuggestion(
    current: GetSuggestionCmd,
    baseline: GetSuggestionCmd,
  ): Promise<string> {
    const prompt = this.buildPrompt(current, baseline);

    this.logger.debug(`Calling Groq API for metric: ${current.metric}`);

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
              'You are an expert energy data analyst for smart building management systems. Always respond in English, in a professional and concise manner.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
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

    return text.trim();
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
- If deviation is below +15%: respond ONLY with "No action required."
- If deviation is above +15%: write ONE direct action to reduce usage.
- Actions must be simple and concrete (e.g. "Turn off the lights from 9:00 PM to 6:00 AM." or "Set the thermostat to 20°C during the night.").
- Maximum 2 sentences.
- Do NOT mention numbers, device names, or technical terms.
- Do NOT explain the problem. Only state the action.
- Tone: formal, direct, imperative.
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
