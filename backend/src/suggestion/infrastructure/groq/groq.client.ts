import { GetSuggestionCmd } from 'src/suggestion/application/commands/get-suggestion.cmd';
import { GroqSuggestionResult } from '../dtos/groq-suggestion-result.dto';

export interface GroqClient {
  /**
   * @param current  - dati del grafico corrente da analizzare
   * @param baseline - dati di riferimento "normali" con cui confrontare
   * @returns        - testo grezzo della suggestion generata da Gemini
   */
  generateSuggestion(
    current: GetSuggestionCmd,
    baseline: GetSuggestionCmd,
  ): Promise<GroqSuggestionResult>;
}

export const GROQ_CLIENT = 'GROQ_CLIENT';
