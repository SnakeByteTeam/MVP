import { Plot } from "src/analytics/domain/plot.model";
import { GetAnalyticsCmd } from "../../commands/get-analytics.cmd";

export interface GetAnalyticsUseCase {
    getAnalytics(cmd: GetAnalyticsCmd): Promise<Plot>;
}

export const GET_ANALYTICS_USECASE = 'GET_ANALYTICS_USECASE';
