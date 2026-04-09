import { Series } from './series.model';
import { Suggestion } from './suggestion.model';

export class Plot {
  constructor(
    private readonly title: string,
    private readonly metric: string,
    private readonly unit: string,
    private readonly labels: string[],
    private readonly series: Series[],
    private suggestion?: Suggestion,
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

  getSuggestion(): Suggestion | undefined {
    return this.suggestion;
  }

  setSuggestion(s: Suggestion) {
    this.suggestion = s;
  }
}
