import { Series } from './series.model';

export class Plot {
  constructor(
    private readonly title: string,
    private readonly metric: string,
    private readonly unit: string,
    private readonly labels: string[],
    private readonly series: Series[],
  ) {}

  getTitle(): string {
    return this.title;
  }

  getMetric(): string {
    return this.metric;
  }

  getUnit(): string {
    return this.unit;
  }

  getLabels(): string[] {
    return this.labels;
  }

  getSeries(): Series[] {
    return this.series;
  }
}
