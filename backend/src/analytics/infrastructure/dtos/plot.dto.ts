import { Plot } from '../../domain/plot.model';

export class PlotDto {
  private constructor(
    public readonly title: string,
    public readonly metric: string,
    public readonly labels: string[],
    public readonly data: string[],
    public readonly series?: Record<string, string[]>, // serie aggiuntive
  ) {}

  static fromDomain(p: Plot): PlotDto {
    return new PlotDto(p.title, p.metric, p.labels, p.data, p.series);
  }
}
