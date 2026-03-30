import { Suggestion } from '../../../domain/suggestion.model';
import { GetSuggestionCmd } from '../../commands/get-suggestion.cmd';

export interface GetSuggestionUseCase {
  getSuggestion(cmd: GetSuggestionCmd): Promise<Suggestion>;
}

export const GET_SUGGESTION_USECASE = 'GET_SUGGESTION_USECASE';
