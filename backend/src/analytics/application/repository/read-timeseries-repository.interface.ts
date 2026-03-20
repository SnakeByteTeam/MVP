export interface ReadTimeseriesRepositoryPort {
  query(params: string): Promise<any>;
}

export const READ_TIMESERIES_REPOSITORY_INTERFACE =
  'READ_TIMESERIES_REPOSITORY_INTERFACE';
