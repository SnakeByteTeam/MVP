import { Suggestion } from '../../domain/suggestion.model';

export class SuggestionDto {
  private constructor(public readonly message: string) {}

  static fromDomain(s: Suggestion): SuggestionDto {
    return new SuggestionDto(s.getMessage());
  }
}
