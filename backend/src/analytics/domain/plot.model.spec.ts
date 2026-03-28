import { Plot } from './plot.model';

describe('Plot', () => {
  let plot: Plot;

  const title = 'Test Analytics';
  const metric = 'test-metric';
  const labels = ['2026-03-25', '2026-03-26'];
  const data = ['10', '20'];
  const series = { resolved: ['5', '10'] };

  beforeEach(() => {
    plot = new Plot(title, metric, labels, data, series);
  });

  it('should be defined', () => {
    expect(plot).toBeDefined();
  });

  it('should return the correct title', () => {
    expect(plot.getTitle()).toBe(title);
  });

  it('should return the correct metric', () => {
    expect(plot.getMetric()).toBe(metric);
  });

  it('should return the correct labels', () => {
    expect(plot.getLabels()).toEqual(labels);
  });

  it('should return the correct data', () => {
    expect(plot.getData()).toEqual(data);
  });

  it('should return the correct series', () => {
    expect(plot.getSeries()).toEqual(series);
  });

  it('should handle undefined series', () => {
    const plotWithoutSeries = new Plot(title, metric, labels, data);
    expect(plotWithoutSeries.getSeries()).toBeUndefined();
  });
});
