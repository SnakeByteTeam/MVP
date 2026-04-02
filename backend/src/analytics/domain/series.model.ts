export class Series {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly data: number[],
  ) {}

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getData(): number[] {
    return this.data;
  }
}
