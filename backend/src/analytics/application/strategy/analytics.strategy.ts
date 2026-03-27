import { Plot } from 'src/analytics/domain/plot.model';
import { GetAnalyticsCmd } from '../commands/get-analytics.cmd';

export interface AnalyticsStrategy {
  execute(cmd: GetAnalyticsCmd): Promise<Plot>;
}

export const ANALYTICS_STRATEGIES = 'ANALYTICS_STRATEGIES';
