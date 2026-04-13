import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WardRealtimeCacheService } from 'src/app/core/alarm/services/ward-realtime-cache.service';

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

	it('getWardIds restituisce [] per userId vuoto', () => {
		expect(service.getWardIds('   ')).toEqual([]);
		expect(service.getWardIds('')).toEqual([]);
	});

	it('setWardIds restituisce [] per userId vuoto', () => {
		expect(service.setWardIds('', ['ward-1'])).toEqual([]);
	});

	it('clearWardIds non fa nulla per userId vuoto', () => {
		expect(() => service.clearWardIds('')).not.toThrow();
	});

	it('clearWardIds non fa nulla se userId non presente in cache', () => {
		service.setWardIds('user-a', ['10']);
		expect(() => service.clearWardIds('user-nonexistent')).not.toThrow();
		expect(service.getWardIds('user-a')).toEqual(['10']);
	});

	it('clearAll svuota tutta la cache', () => {
		service.setWardIds('user-a', ['10']);
		service.setWardIds('user-b', ['20']);
		service.clearAll();
		expect(service.getWardIds('user-a')).toEqual([]);
		expect(service.getWardIds('user-b')).toEqual([]);
	});

	it('recupera cache vuota quando storage contiene dati malformati (non WardIdsByUser)', () => {
		globalThis.sessionStorage.setItem('alarm-realtime-ward-ids-by-user', JSON.stringify({ user: 'not-an-array' }));
		expect(service.getWardIds('user')).toEqual([]);
	});

	it('scrive in sessionStorage e poi legge correttamente a freddo', () => {
		service.setWardIds('u1', ['w1', 'w2']);
		// Simulate fresh service reading from persisted session
		const freshService = new WardRealtimeCacheService();
		expect(freshService.getWardIds('u1')).toEqual(['w1', 'w2']);
	});
});
