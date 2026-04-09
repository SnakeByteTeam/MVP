import { TestBed } from '@angular/core/testing';
import { firstValueFrom, take } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmManagementRefreshService } from './alarm-management-refresh.service';

describe('AlarmManagementRefreshService', () => {
    let service: AlarmManagementRefreshService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AlarmManagementRefreshService],
        });

        service = TestBed.inject(AlarmManagementRefreshService);
    });

    it('espone un observable hot che emette alla richiesta di refresh', async () => {
        const refreshPromise = firstValueFrom(service.getRefreshRequested$().pipe(take(1)));

        service.requestRefresh();

        await expect(refreshPromise).resolves.toBeUndefined();
    });

    it('non bufferizza refresh precedenti per nuovi subscriber', async () => {
        service.requestRefresh();

        const nextEmission = vi.fn();
        const subscription = service.getRefreshRequested$().subscribe(nextEmission);

        expect(nextEmission).not.toHaveBeenCalled();

        service.requestRefresh();
        expect(nextEmission).toHaveBeenCalledTimes(1);

        subscription.unsubscribe();
    });
});