import { Inject, Injectable } from '@nestjs/common';
import { GetSuggestionCmd } from 'src/analytics/application/commands/get-suggestion.cmd';
import { LLMSuggestionPort } from 'src/analytics/application/ports/out/llm-suggestion.port';
import { Suggestion } from 'src/analytics/domain/suggestion.model';
import {
  BASELINE_REGISTRY,
  SupportedMetric,
} from 'src/analytics/infrastructure/config-suggestion/suggestion-baseline.config';
import {
  GROQ_CLIENT,
  GroqClient,
} from 'src/analytics/infrastructure/groq/groq.client';

@Injectable()
export class LLMSuggestionAdapter implements LLMSuggestionPort {
  constructor(
    @Inject(GROQ_CLIENT)
    private readonly groqClient: GroqClient,
  ) {}

  async generateSuggestion(cmd: GetSuggestionCmd): Promise<Suggestion> {
    const baselineFactory = BASELINE_REGISTRY[cmd.metric as SupportedMetric];

    if (!baselineFactory) {
      return new Suggestion([], false);
    }

    const baseline = baselineFactory();

    const result = await this.groqClient.generateSuggestion(cmd, baseline);
    return new Suggestion(result.message, result.isSuggestion);
  }
}
