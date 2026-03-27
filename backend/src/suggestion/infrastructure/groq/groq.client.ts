import { GetSuggestionCmd } from 'src/suggestion/application/commands/get-suggestion.cmd';

export interface GroqClient {
  /**
   * @param current  - dati del grafico corrente da analizzare
   * @param baseline - dati di riferimento "normali" con cui confrontare
   * @returns        - testo grezzo della suggestion generata da Gemini
   */
  generateSuggestion(
    current: GetSuggestionCmd,
    baseline: GetSuggestionCmd,
  ): Promise<string>;
}

export const GROQ_CLIENT = 'GROQ_CLIENT';
