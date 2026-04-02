import { Series } from '../../domain/series.model';

export class SeriesDto {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly data: number[],
  ) {}

  static fromDomain(s: Series): SeriesDto {
    return new SeriesDto(s.getId(), s.getName(), s.getData());
  }
}
