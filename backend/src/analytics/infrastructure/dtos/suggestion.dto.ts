import { Suggestion } from 'src/analytics/domain/suggestion.model';

export class SuggestionDto {
  private constructor(
    public readonly message: string[],
    public readonly isSuggestion: boolean,
  ) {}

  static fromDomain(s: Suggestion): SuggestionDto {
    return new SuggestionDto(s.getMessage(), s.getIsSuggestion());
  }
}
