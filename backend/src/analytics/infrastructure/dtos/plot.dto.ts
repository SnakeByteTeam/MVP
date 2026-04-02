import { Plot } from '../../domain/plot.model';
import { SeriesDto } from './series.dto';
import { SuggestionDto } from './suggestion.dto';

export class PlotDto {
  private constructor(
    public readonly title: string,
    public readonly metric: string,
    public readonly unit: string,
    public readonly labels: string[],
    public readonly series: SeriesDto[],
    public readonly suggestion: SuggestionDto | undefined,
  ) {}

  static fromDomain(p: Plot): PlotDto {
    const suggestion = p.getSuggestion();
    return new PlotDto(
      p.getTitle(),
      p.getMetric(),
      p.getUnit(),
      p.getLabels(),
      p.getSeries().map((s) => SeriesDto.fromDomain(s)),
      suggestion ? SuggestionDto.fromDomain(suggestion) : undefined,
    );
  }
}
