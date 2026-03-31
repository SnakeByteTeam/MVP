import { GetSuggestionCmd } from 'src/analytics/application/commands/get-suggestion.cmd';
import { Series } from 'src/analytics/domain/series.model';

function generateLast30Days(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

type Season = 'winter' | 'spring' | 'summer' | 'autumn';

function getSeason(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function stableRandom(seed: number, min: number, max: number): number {
  const pseudo = Math.abs(Math.sin(seed * 9301 + 49297) * 233280) % 1;
  return parseFloat((min + pseudo * (max - min)).toFixed(2));
}

function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6;
}

// ---------------------------------------------------------------------------
// PLANT-CONSUMPTION BASELINE
// ---------------------------------------------------------------------------

const CONSUMPTION_RANGES: Record<
  Season,
  { weekday: [number, number]; weekend: [number, number] }
> = {
  winter: { weekday: [70, 80], weekend: [60, 70] },
  spring: { weekday: [60, 70], weekend: [50, 60] },
  summer: { weekday: [50, 60], weekend: [40, 50] },
  autumn: { weekday: [60, 70], weekend: [50, 60] },
};

function buildConsumptionBaseline(): GetSuggestionCmd {
  const labels = generateLast30Days();
  const season = getSeason(new Date().getMonth() + 1);
  const ranges = CONSUMPTION_RANGES[season];

  const data = labels.map((label, i) => {
    const [min, max] = isWeekend(label) ? ranges.weekend : ranges.weekday;
    return stableRandom(i, min, max);
  });

  const series = [new Series('plant-consumption', 'Plant Consumption', data)];
  return new GetSuggestionCmd(
    'Plant Consumption',
    'plant-consumption',
    'Wh',
    labels,
    series,
  );
}

// ---------------------------------------------------------------------------
// THERMOSTAT-TEMPERATURE BASELINE
// ---------------------------------------------------------------------------

const TEMPERATURE_RANGES: Record<Season, [number, number]> = {
  winter: [18, 21],
  spring: [21, 23],
  summer: [20, 24],
  autumn: [20, 22],
};

function buildTemperatureBaseline(): GetSuggestionCmd {
  const labels = generateLast30Days();
  const season = getSeason(new Date().getMonth() + 1);
  const [min, max] = TEMPERATURE_RANGES[season];

  const data = labels.map((_, i) => stableRandom(i, min, max));
  const series = [
    new Series('thermostat-temperature', 'Thermostat Temperature', data),
  ];

  return new GetSuggestionCmd(
    'Thermostat Temperature',
    'thermostat-temperature',
    '°C',
    labels,
    series,
  );
}

// ---------------------------------------------------------------------------
// SENSOR-PRESENCE BASELINE
// ---------------------------------------------------------------------------
//
// Range presenze giornaliere per stagione:
//   - Inverno:   3–6 eventi/giorno (anziani più sedentari)
//   - Primavera: 4–7 eventi/giorno
//   - Estate:    3–5 eventi/giorno
//   - Autunno:   4–6 eventi/giorno
// ---------------------------------------------------------------------------

const PRESENCE_RANGES: Record<Season, [number, number]> = {
  winter: [3, 6],
  spring: [4, 7],
  summer: [3, 5],
  autumn: [4, 6],
};

function buildPresenceBaseline(
  metric: 'sensor-presence' | 'sensor-long-presence',
  title: string,
  sensorIds: { id: string; name: string }[],
): GetSuggestionCmd {
  const labels = generateLast30Days();
  const season = getSeason(new Date().getMonth() + 1);
  const [min, max] = PRESENCE_RANGES[season];

  const rangeMod = metric === 'sensor-long-presence' ? 0.3 : 1;

  const series = sensorIds.map(
    ({ id, name }, sensorIdx) =>
      new Series(
        id,
        name,
        labels.map((_, dayIdx) =>
          stableRandom(
            dayIdx + sensorIdx * 100,
            min * rangeMod,
            max * rangeMod,
          ),
        ),
      ),
  );

  return new GetSuggestionCmd(title, metric, 'events', labels, series);
}

// ---------------------------------------------------------------------------
// REGISTRY
// ---------------------------------------------------------------------------

export type SupportedMetric = 'plant-consumption' | 'thermostat-temperature';

export const BASELINE_REGISTRY: Record<
  SupportedMetric,
  (sensorIds?: { id: string; name: string }[]) => GetSuggestionCmd
> = {
  'plant-consumption': () => buildConsumptionBaseline(),
  'thermostat-temperature': () => buildTemperatureBaseline(),
};
