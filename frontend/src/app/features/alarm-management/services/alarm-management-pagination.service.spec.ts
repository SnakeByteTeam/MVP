import { TestBed } from '@angular/core/testing';
import { firstValueFrom, take } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { AlarmManagementPaginationService } from './alarm-management-pagination.service';

describe('AlarmManagementPaginationService', () => {
    let service: AlarmManagementPaginationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AlarmManagementPaginationService],
        });

        service = TestBed.inject(AlarmManagementPaginationService);
    });

    it('espone configurazione iniziale coerente', async () => {
        const pageOffset = await firstValueFrom(service.pageOffset$.pipe(take(1)));
        const canGoNext = await firstValueFrom(service.canGoNext$.pipe(take(1)));

        expect(service.pageLimit).toBe(6);
        expect(pageOffset).toBe(0);
        expect(canGoNext).toBe(false);
        expect(service.canGoPrevious()).toBe(false);
        expect(service.toPageNumber(pageOffset)).toBe(1);
    });

    it('reset riporta offset e canGoNext ai valori iniziali', async () => {
        service.update(12, true);
        service.reset();

        const pageOffset = await firstValueFrom(service.pageOffset$.pipe(take(1)));
        const canGoNext = await firstValueFrom(service.canGoNext$.pipe(take(1)));

        expect(pageOffset).toBe(0);
        expect(canGoNext).toBe(false);
    });

    it('calcola correttamente gli offset di navigazione', () => {
        service.update(12, true);

        expect(service.getOffset()).toBe(12);
        expect(service.getNextOffset()).toBe(18);
        expect(service.getPreviousOffset()).toBe(6);
        expect(service.canGoPrevious()).toBe(true);
        expect(service.canGoNext()).toBe(true);
    });

    it('getPreviousOffset non scende sotto zero', () => {
        service.update(0, false);

        expect(service.getPreviousOffset()).toBe(0);
    });

    it('toPageNumber converte offset in numero pagina 1-based', () => {
        expect(service.toPageNumber(0)).toBe(1);
        expect(service.toPageNumber(6)).toBe(2);
        expect(service.toPageNumber(12)).toBe(3);
    });
});
