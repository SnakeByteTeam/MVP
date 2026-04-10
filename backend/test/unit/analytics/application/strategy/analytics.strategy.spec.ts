import {
  ANALYTICS_STRATEGIES,
  AnalyticsStrategy,
} from 'src/analytics/application/strategy/analytics.strategy';
import { GetAnalyticsCmd } from 'src/analytics/application/commands/get-analytics.cmd';
import { Plot } from 'src/analytics/domain/plot.model';
import { Series } from 'src/analytics/domain/series.model';

describe('AnalyticsStrategy token', () => {
  it('espone il token DI atteso', () => {
    expect(ANALYTICS_STRATEGIES).toBe('ANALYTICS_STRATEGIES');
  });

  it('rispetta il contratto execute(cmd)', async () => {
    const series = new Series('series-1', 'consumi', [1]);
    const plot = new Plot('Titolo', 'Metrica', 'kWh', ['A'], [series]);
    const strategy: AnalyticsStrategy = {
      execute: jest.fn().mockResolvedValue(plot),
    };
    const cmd = new GetAnalyticsCmd('plant-consumption');

    const result = await strategy.execute(cmd);

    expect(strategy.execute).toHaveBeenCalledWith(cmd);
    expect(result.getLabels()).toEqual(['A']);
    expect(result.getSeries()[0].getData()).toEqual([1]);
  });
});
