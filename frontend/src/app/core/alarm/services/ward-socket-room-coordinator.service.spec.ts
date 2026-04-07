import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WardRealtimeCacheService } from './ward-realtime-cache.service';
import { WardSocketRoomCoordinatorService } from './ward-socket-room-coordinator.service';

describe('WardSocketRoomCoordinatorService', () => {
	let service: WardSocketRoomCoordinatorService;

	const cacheSpy = {
		getWardIds: vi.fn(),
		setWardIds: vi.fn(),
		clearWardIds: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		cacheSpy.getWardIds.mockReturnValue([]);

		TestBed.configureTestingModule({
			providers: [
				WardSocketRoomCoordinatorService,
				{ provide: WardRealtimeCacheService, useValue: cacheSpy },
			],
		});

		service = TestBed.inject(WardSocketRoomCoordinatorService);
	});

	it('activateUser carica wardIds da cache e propone join', () => {
		cacheSpy.getWardIds.mockReturnValue(['10', '11']);

		const actions = service.activateUser('user-1');

		expect(actions.roomsToLeave).toEqual([]);
		expect(actions.roomsToJoin).toEqual(['10', '11']);
		expect(service.getJoinedRooms()).toEqual(['10', '11']);
	});

	it('requestJoinRoom deduplica e persiste su cache', () => {
		service.activateUser('user-1');

		expect(service.requestJoinRoom(' 20 ')).toBe('20');
		expect(service.requestJoinRoom('20')).toBeNull();
		expect(cacheSpy.setWardIds).toHaveBeenCalled();
	});

	it('deactivateUser rimuove room runtime e pulisce cache utente corrente', () => {
		service.activateUser('user-1');
		service.requestJoinRoom('30');

		const roomsToLeave = service.deactivateUser();

		expect(roomsToLeave).toEqual(['30']);
		expect(service.getJoinedRooms()).toEqual([]);
		expect(cacheSpy.clearWardIds).toHaveBeenCalledWith('user-1');
	});

	it('switch utente restituisce room da lasciare e room cache del nuovo utente', () => {
		cacheSpy.getWardIds
			.mockReturnValueOnce(['10'])
			.mockReturnValueOnce(['40', '50']);

		service.activateUser('user-1');
		service.requestJoinRoom('30');
		const actions = service.activateUser('user-2');

		expect(actions.roomsToLeave).toEqual(['10', '30']);
		expect(actions.roomsToJoin).toEqual(['40', '50']);
		expect(service.getJoinedRooms()).toEqual(['40', '50']);
	});
});
