export class Plot {
  constructor(
    public readonly title: string,
    public readonly metric: string,
    public readonly labels: string[],
    public readonly data: string[],
  ) {}
}