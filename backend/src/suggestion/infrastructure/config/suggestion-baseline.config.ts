// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

import { GetSuggestionCmd } from 'src/suggestion/application/commands/get-suggestion.cmd';

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
  return 'winter'; // 12, 1, 2
}

/** Restituisce un numero casuale deterministico nel range [min, max] con 2 decimali */
function stableRandom(seed: number, min: number, max: number): string {
  const pseudo = Math.abs(Math.sin(seed * 9301 + 49297) * 233280) % 1;
  return (min + pseudo * (max - min)).toFixed(2);
}

function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6;
}

// ---------------------------------------------------------------------------
// PLANT-CONSUMPTION BASELINE
// ---------------------------------------------------------------------------
//
// Dispositivo: SF_Light (10W)
// Pattern ore accensione per stagione:
//   - Inverno:          7–8h  (buio precoce, luce naturale scarsa)
//   - Primavera/Autunno: 6–7h (transizione)
//   - Estate:           5–6h  (molta luce naturale, accensione ridotta)
//   - Weekend:          -1h rispetto ai giorni feriali (meno attività)
//
// Consumo = 10W * ore → range Wh:
//   Inverno:            70–80 Wh/giorno (feriale), 60–70 Wh (weekend)
//   Primavera/Autunno:  60–70 Wh/giorno (feriale), 50–60 Wh (weekend)
//   Estate:             50–60 Wh/giorno (feriale), 40–50 Wh (weekend)
//
// Soglia anomalia di sistema: 10W * 6.5h * 1.5 = 97.5 Wh
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

  return new GetSuggestionCmd('plant-consumption', labels, data);
}

// ---------------------------------------------------------------------------
// THERMOSTAT-TEMPERATURE BASELINE
// ---------------------------------------------------------------------------
//
// Range temperature per stagione (°C):
//   - Inverno:          19–21°C (riscaldamento attivo)
//   - Primavera:        21–23°C (transizione, riscaldamento ridotto)
//   - Estate:           24–26°C (condizionamento attivo)
//   - Autunno:          20–22°C (transizione, riscaldamento in avvio)
//
// Variazione giornaliera realistica: ±0.5°C tra un giorno e l'altro
// ---------------------------------------------------------------------------

const TEMPERATURE_RANGES: Record<Season, [number, number]> = {
  winter: [19, 21],
  spring: [21, 23],
  summer: [24, 26],
  autumn: [20, 22],
};

function buildTemperatureBaseline(): GetSuggestionCmd {
  const labels = generateLast30Days();
  const season = getSeason(new Date().getMonth() + 1);
  const [min, max] = TEMPERATURE_RANGES[season];

  const data = labels.map((_, i) => stableRandom(i, min, max));

  return new GetSuggestionCmd('thermostat-temperature', labels, data);
}

// ---------------------------------------------------------------------------
// REGISTRY
// ---------------------------------------------------------------------------

export type SupportedMetric = 'plant-consumption' | 'thermostat-temperature';

export const BASELINE_REGISTRY: Record<
  SupportedMetric,
  () => GetSuggestionCmd
> = {
  'plant-consumption': buildConsumptionBaseline,
  'thermostat-temperature': buildTemperatureBaseline,
};
