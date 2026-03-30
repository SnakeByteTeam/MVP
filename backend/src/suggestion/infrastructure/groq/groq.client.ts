import { GetSuggestionCmd } from 'src/suggestion/application/commands/get-suggestion.cmd';
import { GroqSuggestionResult } from '../dtos/groq-suggestion-result.dto';

export interface GroqClient {
  generateSuggestion(
    current: GetSuggestionCmd,
    baseline: GetSuggestionCmd,
  ): Promise<GroqSuggestionResult>;
}

export const GROQ_CLIENT = 'GROQ_CLIENT';
