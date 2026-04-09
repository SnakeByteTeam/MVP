import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WardRealtimeCacheService } from './ward-realtime-cache.service';

describe('WardRealtimeCacheService', () => {
	let service: WardRealtimeCacheService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [WardRealtimeCacheService],
		});

		service = TestBed.inject(WardRealtimeCacheService);
		service.clearAll();
	});

	it('mergeWardIds deduplica e normalizza valori stringa/numero', () => {
		service.mergeWardIds('user-1', [1, '1', ' 2 ', null, undefined, '']);
		service.mergeWardIds('user-1', ['2', 3]);

		expect(service.getWardIds('user-1')).toEqual(['1', '2', '3']);
	});

	it('mantiene cache separata per utente', () => {
		service.setWardIds('user-a', ['10']);
		service.setWardIds('user-b', ['11', '12']);

		expect(service.getWardIds('user-a')).toEqual(['10']);
		expect(service.getWardIds('user-b')).toEqual(['11', '12']);
	});

	it('clearWardIds rimuove solo l utente target', () => {
		service.setWardIds('user-a', ['10']);
		service.setWardIds('user-b', ['11']);

		service.clearWardIds('user-a');

		expect(service.getWardIds('user-a')).toEqual([]);
		expect(service.getWardIds('user-b')).toEqual(['11']);
	});

	it('recupera cache vuota in caso di JSON non valido', () => {
		globalThis.sessionStorage.setItem('alarm-realtime-ward-ids-by-user', 'not-json');

		expect(service.getWardIds('user-z')).toEqual([]);
	});
});
