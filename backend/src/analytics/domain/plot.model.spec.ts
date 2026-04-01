import { Plot } from './plot.model';
import { Series } from './series.model';
import { Suggestion } from './suggestion.model';

describe('Plot', () => {
  const title = 'Test Analytics';
  const metric = 'test-metric';
  const unit = '°C';
  const labels = ['2026-03-25', '2026-03-26'];
  const series = [
    new Series('s-001', 'Sensor-Bathroom', [20, 22]),
    new Series('s-002', 'Sensor-LivingRoom', [55, 60]),
  ];

  describe('with series', () => {
    let plot: Plot;

    beforeEach(() => {
      plot = new Plot(title, metric, unit, labels, series);
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

    it('should return the correct unit', () => {
      expect(plot.getUnit()).toBe(unit);
    });

    it('should return the correct labels', () => {
      expect(plot.getLabels()).toEqual(labels);
    });

    it('should return the correct series', () => {
      expect(plot.getSeries()).toEqual(series);
    });

    it('should return undefined suggestion when not set', () => {
      expect(plot.getSuggestion()).toBeUndefined();
    });

    it('should return the suggestion after setSuggestion is called', () => {
      const suggestion = new Suggestion('Turn off the lights.', true);
      plot.setSuggestion(suggestion);
      expect(plot.getSuggestion()).toBe(suggestion);
    });
  });

  describe('with empty series', () => {
    let plot: Plot;

    beforeEach(() => {
      plot = new Plot(title, metric, unit, [], []);
    });

    it('should return empty labels', () => {
      expect(plot.getLabels()).toHaveLength(0);
    });

    it('should return empty series', () => {
      expect(plot.getSeries()).toHaveLength(0);
    });
  });

  describe('with suggestion in constructor', () => {
    it('should return the suggestion passed in the constructor', () => {
      const suggestion = new Suggestion('No action required.', false);
      const plot = new Plot(title, metric, unit, labels, series, suggestion);
      expect(plot.getSuggestion()).toBe(suggestion);
    });
  });
});

describe('Series', () => {
  const id = 's-001';
  const name = 'Sensor-Bathroom';
  const data = [20, 22, 19];

  let series: Series;

  beforeEach(() => {
    series = new Series(id, name, data);
  });

  it('should be defined', () => {
    expect(series).toBeDefined();
  });

  it('should return the correct id', () => {
    expect(series.getId()).toBe(id);
  });

  it('should return the correct name', () => {
    expect(series.getName()).toBe(name);
  });

  it('should return the correct data', () => {
    expect(series.getData()).toEqual(data);
  });
});
