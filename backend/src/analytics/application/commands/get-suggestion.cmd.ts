import { Series } from 'src/analytics/domain/series.model';

export class GetSuggestionCmd {
  readonly title: string;
  readonly metric: string;
  readonly unit: string;
  readonly labels: string[];
  readonly series: Series[];

  constructor(
    title: string,
    metric: string,
    unit: string,
    labels: string[],
    series: Series[],
  ) {
    this.title = title;
    this.metric = metric;
    this.unit = unit;
    this.labels = labels;
    this.series = series;
  }
}
