import { Injectable, InjectionToken, inject } from '@angular/core';
import { WardRealtimeCacheService } from './ward-realtime-cache.service';

export interface UserActivationActions {
	roomsToLeave: string[];
	roomsToJoin: string[];
}

export interface WardSocketRoomCoordinatorPort {
	activateUser(userId: string): UserActivationActions;
	deactivateUser(): string[];
	requestJoinRoom(wardId: string): string | null;
	requestLeaveRoom(wardId: string): string | null;
	getJoinedRooms(): string[];
	resetRuntimeState(): void;
}

export const WARD_SOCKET_ROOM_COORDINATOR = new InjectionToken<WardSocketRoomCoordinatorPort>(
	'WARD_SOCKET_ROOM_COORDINATOR',
	{
		providedIn: 'root',
		factory: () => inject(WardSocketRoomCoordinatorService),
	}
);

@Injectable({ providedIn: 'root' })
export class WardSocketRoomCoordinatorService implements WardSocketRoomCoordinatorPort {
	private readonly wardRealtimeCache = inject(WardRealtimeCacheService, { optional: true });

	private readonly joinedRooms = new Set<string>();
	private currentUserId: string | null = null;

	public activateUser(userId: string): UserActivationActions {
		const normalizedUserId = userId.trim();
		if (!normalizedUserId) {
			return { roomsToLeave: [], roomsToJoin: [] };
		}

		const roomsToLeave =
			this.currentUserId && this.currentUserId !== normalizedUserId
				? Array.from(this.joinedRooms.values())
				: [];

		if (roomsToLeave.length > 0) {
			this.joinedRooms.clear();
		}

		this.currentUserId = normalizedUserId;

		const cachedWardIds = this.wardRealtimeCache?.getWardIds(normalizedUserId) ?? [];
		const roomsToJoin: string[] = [];

		for (const cachedWardId of cachedWardIds) {
			if (this.joinedRooms.has(cachedWardId)) {
				continue;
			}

			this.joinedRooms.add(cachedWardId);
			roomsToJoin.push(cachedWardId);
		}

		this.persistJoinedRooms();

		return { roomsToLeave, roomsToJoin };
	}

	public deactivateUser(): string[] {
		if (this.currentUserId && this.wardRealtimeCache) {
			this.wardRealtimeCache.clearWardIds(this.currentUserId);
		}

		this.currentUserId = null;
		const roomsToLeave = Array.from(this.joinedRooms.values());
		this.joinedRooms.clear();
		return roomsToLeave;
	}

	public requestJoinRoom(wardId: string): string | null {
		const normalizedWardId = wardId.trim();
		if (!normalizedWardId || this.joinedRooms.has(normalizedWardId)) {
			return null;
		}

		this.joinedRooms.add(normalizedWardId);
		this.persistJoinedRooms();
		return normalizedWardId;
	}

	public requestLeaveRoom(wardId: string): string | null {
		const normalizedWardId = wardId.trim();
		if (!normalizedWardId || !this.joinedRooms.has(normalizedWardId)) {
			return null;
		}

		this.joinedRooms.delete(normalizedWardId);
		this.persistJoinedRooms();
		return normalizedWardId;
	}

	public getJoinedRooms(): string[] {
		return Array.from(this.joinedRooms.values());
	}

	public resetRuntimeState(): void {
		this.currentUserId = null;
		this.joinedRooms.clear();
	}

	private persistJoinedRooms(): void {
		if (!this.currentUserId || !this.wardRealtimeCache) {
			return;
		}

		this.wardRealtimeCache.setWardIds(this.currentUserId, Array.from(this.joinedRooms.values()));
	}
}
