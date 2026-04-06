export class Notification {
  private readonly message: string;

  constructor(message: string) {
    this.message = message;
  }

  getMessage(): string {
    return this.message;
  }
}
