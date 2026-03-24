import { Pipe, PipeTransform } from '@angular/core';

type ElapsedUnit = {
  seconds: number;
  singular: string;
  plural: string;
};

//per fargli scrivere le cose con la giusta distizionee
const ELAPSED_UNITS: readonly ElapsedUnit[] = [
  { seconds: 365 * 24 * 60 * 60, singular: 'anno', plural: 'anni' },
  { seconds: 30 * 24 * 60 * 60, singular: 'mese', plural: 'mesi' },
  { seconds: 24 * 60 * 60, singular: 'giorno', plural: 'giorni' },
  { seconds: 60 * 60, singular: 'ora', plural: 'ore' },
  { seconds: 60, singular: 'minuto', plural: 'minuti' },
];

@Pipe({ name: 'elapsedTime', standalone: true, pure: true })
export class ElapsedTimePipe implements PipeTransform {
  transform(sentAt: string): string {
    const parsedTimestamp = Date.parse(sentAt);
    if (Number.isNaN(parsedTimestamp)) {
      return sentAt;
    }

    const deltaMs = Date.now() - parsedTimestamp;
    if (deltaMs < 0) {
      return 'tra poco';
    }

    const deltaSeconds = Math.floor(deltaMs / 1000);
    if (deltaSeconds < 60) {
      return 'meno di 1 minuto fa';
    }

    for (const unit of ELAPSED_UNITS) {
      const amount = Math.floor(deltaSeconds / unit.seconds);
      if (amount >= 1) {
        return this.formatElapsed(amount, unit.singular, unit.plural);
      }
    }

    return 'meno di 1 minuto fa';
  }

  private formatElapsed(amount: number, singular: string, plural: string): string {
    if (amount === 1) {
      return `1 ${singular} fa`;
    }

    return `${amount} ${plural} fa`;
  }
}
