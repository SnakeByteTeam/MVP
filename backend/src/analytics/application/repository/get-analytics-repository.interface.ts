import { DatapointRow } from 'src/analytics/domain/datapoint-row.model';

export interface GetAnalyticsRepositoryPort {
  query(params: string): Promise<DatapointRow[] | any[]>;
}

export const GET_ANALYTICS_REPOSITORY = 'GET_ANALYTICS_REPOSITORY';
