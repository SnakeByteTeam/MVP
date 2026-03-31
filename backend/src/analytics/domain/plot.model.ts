export class Plot {
  constructor(
    private readonly title: string,
    private readonly metric: string,
    private readonly unit: string,
    private readonly labels: string[],
    private readonly data: string[],
    private readonly series?: Record<string, string[]>, // serie aggiuntive
  ) {}

  getTitle(): string {
    return this.title;
  }

  getMetric(): string {
    return this.metric;
  }

  getLabels(): string[] {
    return this.labels;
  }

  getData(): string[] {
    return this.data;
  }

  getSeries(): Record<string, string[]> | undefined {
    return this.series;
  }

  getUnit(): string {
    return this.unit;
  }
}
