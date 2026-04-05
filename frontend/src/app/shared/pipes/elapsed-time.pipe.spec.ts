import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ElapsedTimePipe } from './elapsed-time.pipe';

describe('ElapsedTimePipe', () => {
    let pipe: ElapsedTimePipe;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-03-24T12:00:00.000Z'));
        pipe = new ElapsedTimePipe();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('ritorna il valore originale se la data non e valida', () => {
        expect(pipe.transform('not-a-date')).toBe('not-a-date');
    });

    it('mostra tra poco per timestamp futuri', () => {
        expect(pipe.transform('2026-03-24T12:01:00.000Z')).toBe('tra poco');
    });

    it('mostra secondi compatti per intervalli inferiori a 60 secondi', () => {
        expect(pipe.transform('2026-03-24T11:59:30.000Z')).toBe('00:00');
        expect(pipe.transform('2026-03-24T11:59:01.000Z')).toBe('00:00');
    });

    it('mostra ore e minuti in formato HH:mm per intervalli inferiori a 1 giorno', () => {
        expect(pipe.transform('2026-03-24T11:59:00.000Z')).toBe('00:01');
        expect(pipe.transform('2026-03-24T11:45:00.000Z')).toBe('00:15');
        expect(pipe.transform('2026-03-24T11:00:00.000Z')).toBe('01:00');
        expect(pipe.transform('2026-03-24T10:48:00.000Z')).toBe('01:12');
        expect(pipe.transform('2026-03-24T09:00:00.000Z')).toBe('03:00');
    });

    it('mostra giorni compatti per intervalli pari o superiori a 1 giorno', () => {
        expect(pipe.transform('2026-03-23T12:00:00.000Z')).toBe('1 giorno fa');
        expect(pipe.transform('2026-03-19T12:00:00.000Z')).toBe('5 giorni fa');
    });
});
