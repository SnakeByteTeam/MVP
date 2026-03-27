import { Inject, Injectable } from '@nestjs/common';
import { LLMSuggestionPort } from 'src/suggestion/application/ports/out/llm-suggestion.port';
import { GetSuggestionCmd } from 'src/suggestion/application/commands/get-suggestion.cmd';
import { Suggestion } from 'src/suggestion/domain/suggestion.model';
import {
  GROQ_CLIENT,
  GroqClient,
} from 'src/suggestion/infrastructure/groq/groq.client';
import {
  BASELINE_REGISTRY,
  SupportedMetric,
} from 'src/suggestion/infrastructure/config/suggestion-baseline.config';

@Injectable()
export class LLMSuggestionAdapter implements LLMSuggestionPort {
  constructor(
    @Inject(GROQ_CLIENT)
    private readonly groqClient: GroqClient,
  ) {}

  async generateSuggestion(cmd: GetSuggestionCmd): Promise<Suggestion> {
    const baselineFactory = BASELINE_REGISTRY[cmd.metric as SupportedMetric];

    if (!baselineFactory) {
      throw new Error(
        `No baseline configuration found for metric: ${cmd.metric}`,
      );
    }

    const baseline = baselineFactory();

    const message = await this.groqClient.generateSuggestion(cmd, baseline);
    return new Suggestion(message);
  }
}
