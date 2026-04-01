import { Suggestion } from 'src/analytics/domain/suggestion.model';
import { GetSuggestionCmd } from '../../commands/get-suggestion.cmd';

export interface LLMSuggestionPort {
  generateSuggestion(cmd: GetSuggestionCmd): Promise<Suggestion>;
}

export const LLM_SUGGESTION_PORT = 'LLM_SUGGESTION_PORT';
