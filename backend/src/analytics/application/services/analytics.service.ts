import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetAnalyticsUseCase } from '../ports/in/get-analytics.usecase';
import { AnalyticsStrategy } from '../strategy/analytics.strategy';
import { GetAnalyticsCmd } from '../commands/get-analytics.cmd';
import { Plot } from 'src/analytics/domain/plot.model';
import {
  GET_SUGGESTION_USECASE,
  GetSuggestionUseCase,
} from '../ports/in/get-suggestion.usecase';
import { GetSuggestionCmd } from '../commands/get-suggestion.cmd';
import { ANALYTICS_STRATEGIES_TOKEN } from 'src/analytics/analytics.module';

@Injectable()
export class AnalyticsService implements GetAnalyticsUseCase {
  constructor(
    @Inject(ANALYTICS_STRATEGIES_TOKEN)
    private readonly strategies: Map<string, AnalyticsStrategy>,

    @Inject(GET_SUGGESTION_USECASE)
    private readonly getSuggestionUseCase: GetSuggestionUseCase,
  ) {}

  async getAnalyticsByPlantId(cmd: GetAnalyticsCmd): Promise<Plot[]> {
    const plots: Plot[] = [];

    for (const [key, strategy] of this.strategies.entries()) {
      try {
        const plot = await strategy.execute(cmd);
        const suggestion = await this.getSuggestionUseCase.getSuggestion(
          new GetSuggestionCmd(
            plot.getMetric(),
            plot.getMetric(),
            plot.getUnit(),
            plot.getLabels(),
            plot.getSeries(),
          ),
        );
        plot.setSuggestion(suggestion);
        plots.push(plot);
      } catch (err) {
        Logger.error(
          `Error executing strategy ${key}`,
          err instanceof Error ? err.stack : String(err),
          AnalyticsService.name,
        );
      }
    }

    if (plots.length === 0) {
      throw new Error(`No analytics available for plant ${cmd.plantId}`);
    }

    return plots;
  }
}
