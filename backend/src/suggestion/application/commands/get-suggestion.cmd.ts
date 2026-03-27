export class GetSuggestionCmd {
  readonly metric: string;
  readonly labels: string[];
  readonly data: string[];

  constructor(metric: string, labels: string[], data: string[]) {
    this.metric = metric;
    this.labels = labels;
    this.data = data;
  }
}
