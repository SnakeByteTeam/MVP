import { GetSuggestionCmd } from '../../commands/get-suggestion.cmd';
import { Suggestion } from 'src/suggestion/domain/suggestion.model';

export interface LLMSuggestionPort {
  generateSuggestion(cmd: GetSuggestionCmd): Promise<Suggestion>;
}

export const LLM_SUGGESTION_PORT = 'LLM_SUGGESTION_PORT';
