import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserRole } from '../models/user-role.enum';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { UserSession } from '../../features/user-auth/models/user-session.model';

@Injectable({ providedIn: 'root' })
export class InternalAuthService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = inject(API_BASE_URL);

	private readonly currentUser$ = new BehaviorSubject<UserSession | null>(null);
	private token: string | null = null;

	public login(username: string, password: string): Observable<UserSession> {
		return this.http
			.post<UserSession>(`${this.baseUrl}/auth/login`, { username, password })
			.pipe(tap((session) => this.setSession(session)));
	}

	public setFirstAccessPassword(
		username: string,
		temporaryPassword: string,
		newPassword: string
	): Observable<void> {
		return this.http.post<void>(`${this.baseUrl}/auth/first-access`, {
			username,
			temporaryPassword,
			newPassword,
		});
	}

	public logout(): void {
		this.token = null;
		this.currentUser$.next(null);
	}

	public getToken(): string | null {
		return this.token;
	}

	public getCurrentUser$(): Observable<UserSession | null> {
		return this.currentUser$.asObservable();
	}

	public getRole(): UserRole | null {
		return this.currentUser$.getValue()?.role ?? null;
	}

	public isAuthenticated(): boolean {
		return !!this.token && this.currentUser$.getValue() !== null;
	}

	public hasRole(role: UserRole): boolean {
		return this.getRole() === role;
	}

	private setSession(session: UserSession): void {
		this.token = session.token;
		this.currentUser$.next(session);
	}
}
