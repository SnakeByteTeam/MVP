import { Plot } from '../../domain/plot.model';
import { SeriesDto } from './series.dto';

export class PlotDto {
  private constructor(
    public readonly title: string,
    public readonly metric: string,
    public readonly unit: string,
    public readonly labels: string[],
    public readonly series: SeriesDto[],
  ) {}

  static fromDomain(p: Plot): PlotDto {
    return new PlotDto(
      p.getTitle(),
      p.getMetric(),
      p.getUnit(),
      p.getLabels(),
      p.getSeries().map((s) => SeriesDto.fromDomain(s)),
    );
  }
}
