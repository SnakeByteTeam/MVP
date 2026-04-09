import { Injectable } from '@angular/core';

type WardIdsByUser = Record<string, string[]>;
type WardIdInput = string | number | null | undefined;

const STORAGE_KEY = 'alarm-realtime-ward-ids-by-user';

@Injectable({ providedIn: 'root' })
export class WardRealtimeCacheService {
	public getWardIds(userId: string): string[] {
		const normalizedUserId = this.normalizeUserId(userId);
		if (!normalizedUserId) {
			return [];
		}

		const cache = this.readCache();
		return cache[normalizedUserId] ?? [];
	}

	public setWardIds(userId: string, wardIds: ReadonlyArray<WardIdInput>): string[] {
		const normalizedUserId = this.normalizeUserId(userId);
		if (!normalizedUserId) {
			return [];
		}

		const normalizedWardIds = this.normalizeWardIds(wardIds);
		const cache = this.readCache();
		cache[normalizedUserId] = normalizedWardIds;
		this.writeCache(cache);
		return normalizedWardIds;
	}

	public mergeWardIds(userId: string, wardIds: ReadonlyArray<WardIdInput>): string[] {
		const current = this.getWardIds(userId);
		return this.setWardIds(userId, [...current, ...wardIds]);
	}

	public clearWardIds(userId: string): void {
		const normalizedUserId = this.normalizeUserId(userId);
		if (!normalizedUserId) {
			return;
		}

		const cache = this.readCache();
		if (!(normalizedUserId in cache)) {
			return;
		}

		delete cache[normalizedUserId];
		this.writeCache(cache);
	}

	public clearAll(): void {
		const storage = this.getStorage();
		storage?.removeItem(STORAGE_KEY);
	}

	private normalizeUserId(value: string): string {
		return value.trim();
	}

	private normalizeWardIds(values: ReadonlyArray<WardIdInput>): string[] {
		const normalized = new Set<string>();

		for (const value of values) {
			if (typeof value === 'number') {
				normalized.add(String(value));
				continue;
			}

			if (typeof value === 'string') {
				const trimmed = value.trim();
				if (trimmed) {
					normalized.add(trimmed);
				}
			}
		}

		return Array.from(normalized.values());
	}

	private readCache(): WardIdsByUser {
		const storage = this.getStorage();
		if (!storage) {
			return {};
		}

		const raw = storage.getItem(STORAGE_KEY);
		if (!raw) {
			return {};
		}

		try {
			const parsed = JSON.parse(raw) as unknown;
			if (!this.isWardIdsByUser(parsed)) {
				return {};
			}
			return parsed;
		} catch {
			return {};
		}
	}

	private writeCache(cache: WardIdsByUser): void {
		const storage = this.getStorage();
		if (!storage) {
			return;
		}

		if (Object.keys(cache).length === 0) {
			storage.removeItem(STORAGE_KEY);
			return;
		}

		storage.setItem(STORAGE_KEY, JSON.stringify(cache));
	}

	private getStorage(): Storage | null {
		if (globalThis.sessionStorage === undefined) {
			return null;
		}

		return globalThis.sessionStorage;
	}

	private isWardIdsByUser(value: unknown): value is WardIdsByUser {
		if (!value || typeof value !== 'object') {
			return false;
		}

		return Object.values(value).every(
			(entry) => Array.isArray(entry) && entry.every((wardId) => typeof wardId === 'string')
		);
	}
}
