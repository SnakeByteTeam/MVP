import { Inject, Injectable } from '@nestjs/common';
import { GetSuggestionUseCase } from '../ports/in/get-suggestion.usecase';
import { Suggestion } from 'src/suggestion/domain/suggestion.model';
import { GetSuggestionCmd } from '../commands/get-suggestion.cmd';
import { LLMSuggestionPort } from '../ports/out/llm-suggestion.port';

@Injectable()
export class SuggestionService implements GetSuggestionUseCase {
  constructor(
    @Inject('LLM_SUGGESTION_PORT')
    private readonly llmSuggestionPort: LLMSuggestionPort,
  ) {}

  async getSuggestion(cmd: GetSuggestionCmd): Promise<Suggestion> {
    const res = await this.llmSuggestionPort.generateSuggestion(cmd);

    if (!res) {
      throw new Error(`No suggestion found for this metric: ${cmd.metric}`);
    }
    return res;
  }
}
