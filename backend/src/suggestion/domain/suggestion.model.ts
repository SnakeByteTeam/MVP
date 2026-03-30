export class Suggestion {
  constructor(
    private readonly message: string,
    private readonly isSuggestion: boolean,
  ) {}

  getMessage(): string {
    return this.message;
  }

  getIsSuggestion(): boolean {
    return this.isSuggestion;
  }
}
