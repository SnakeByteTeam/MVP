import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ElapsedTimePipe } from './elapsed-time.pipe';

describe('ElapsedTimePipe', () => {
    let pipe: ElapsedTimePipe;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-03-24T12:00:00.000Z'));
        pipe = new ElapsedTimePipe();
    });

    it('ritorna il valore originale se la data non e valida', () => {
        expect(pipe.transform('not-a-date')).toBe('not-a-date');
    });

    it('mostra tra poco per timestamp futuri', () => {
        expect(pipe.transform('2026-03-24T12:01:00.000Z')).toBe('tra poco');
    });

    it('mostra meno di 1 minuto fa per intervalli inferiori a 60 secondi', () => {
        expect(pipe.transform('2026-03-24T11:59:30.000Z')).toBe('meno di 1 minuto fa');
    });

    it('mostra minuti al singolare e plurale', () => {
        expect(pipe.transform('2026-03-24T11:59:00.000Z')).toBe('1 minuto fa');
        expect(pipe.transform('2026-03-24T11:45:00.000Z')).toBe('15 minuti fa');
    });

    it('mostra ore al singolare e plurale', () => {
        expect(pipe.transform('2026-03-24T11:00:00.000Z')).toBe('1 ora fa');
        expect(pipe.transform('2026-03-24T09:00:00.000Z')).toBe('3 ore fa');
    });

    it('mostra giorni al singolare e plurale', () => {
        expect(pipe.transform('2026-03-23T12:00:00.000Z')).toBe('1 giorno fa');
        expect(pipe.transform('2026-03-19T12:00:00.000Z')).toBe('5 giorni fa');
    });

    it('mostra mesi al singolare e plurale', () => {
        expect(pipe.transform('2026-02-22T12:00:00.000Z')).toBe('1 mese fa');
        expect(pipe.transform('2025-12-24T12:00:00.000Z')).toBe('3 mesi fa');
    });

    it('mostra anni al singolare e plurale', () => {
        expect(pipe.transform('2025-03-24T12:00:00.000Z')).toBe('1 anno fa');
        expect(pipe.transform('2023-03-24T12:00:00.000Z')).toBe('3 anni fa');
    });
});
