import { GetSuggestionCmd } from 'src/analytics/application/commands/get-suggestion.cmd';
import { GroqSuggestionResultDto } from '../dtos/groq-suggestion-result.dto';

export interface GroqClient {
  generateSuggestion(
    current: GetSuggestionCmd,
    baseline: GetSuggestionCmd,
  ): Promise<GroqSuggestionResultDto>;
}

export const GROQ_CLIENT = 'GROQ_CLIENT';
