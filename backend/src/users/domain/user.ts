export class User {
  constructor(
    private readonly id: number,
    private readonly username: string,
    private readonly surname?: string,
    private readonly name?: string,
    private readonly role?: string,
  ) {}

  getId(): number {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  getSurname(): string | undefined {
    return this.surname ?? undefined;
  }

  getName(): string | undefined {
    return this.name ?? undefined;
  }

  getRole(): string | undefined {
    return this.role ?? undefined;
  }
}
