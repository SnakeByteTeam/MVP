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

  async getAnalyticsByPlantId(cmd: GetAnalyticsCmd): Promise<Plot[]> {
    const plots: Plot[] = [];

    for (const [key, strategy] of this.strategies.entries()) {
      try {
        const plot = await strategy.execute(cmd);
        plots.push(plot);
      } catch (err) {
        console.error(`Error executing strategy ${key}:`, err);
      }
    }

    if (plots.length === 0) {
      throw new Error(`No analytics available for plant ${cmd.plantId}`);
    }

    return plots;
  }
}
