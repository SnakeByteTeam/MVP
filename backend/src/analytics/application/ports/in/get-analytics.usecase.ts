import { Plot } from 'src/analytics/domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';

export interface GetAnalyticsUseCase {
  getAnalyticsByPlantId(cmd: GetAnalyticsCmd): Promise<Plot[]>;
}

export const GET_ANALYTICS_USECASE = 'GET_ANALYTICS_USECASE';
