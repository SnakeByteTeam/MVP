import { DatapointRow } from 'src/analytics/domain/datapoint-row.model';

export interface GetAnalyticsRepositoryPort {
  query(params: string): Promise<DatapointRow[] | any[]>;
}

export const READ_TIMESERIES_REPOSITORY_INTERFACE =
  'READ_TIMESERIES_REPOSITORY_INTERFACE';
