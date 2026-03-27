export class Suggestion {
  constructor(private readonly message: string) {}

  getMessage(): string {
    return this.message;
  }
}
