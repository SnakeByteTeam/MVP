import { Inject, Injectable } from '@nestjs/common';
import { GetAnalyticsUseCase } from '../ports/in/get-analytics.usecase';
import { AnalyticsStrategy } from '../strategy/analytics.strategy';
import { GetAnalyticsCmd } from '../commands/get-analytics.cmd';
import { Plot } from 'src/analytics/domain/plot.model';

@Injectable()
export class AnalyticsService implements GetAnalyticsUseCase {
  constructor(
    @Inject('ANALYTICS_STRATEGIES')
    private readonly strategies: Map<string, AnalyticsStrategy>,
  ) {}

  async getAnalytics(cmd: GetAnalyticsCmd): Promise<Plot> {
    const strategy = this.strategies.get(cmd.metric);

    if (!strategy) {
      throw new Error(`No strategy found for metric: ${cmd.metric}`);
    }
    return strategy.execute(cmd);
  }
}
