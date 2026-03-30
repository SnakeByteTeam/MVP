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
    return new PlotDto(
      p.getTitle(),
      p.getMetric(),
      p.getLabels(),
      p.getData(),
      p.getSeries(),
    );
  }
}
