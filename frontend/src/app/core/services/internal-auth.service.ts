import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
	BehaviorSubject,
	Observable,
	catchError,
	finalize,
	map,
	of,
	shareReplay,
	tap,
} from 'rxjs';
import { UserRole } from '../models/user-role.enum';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { UserSession } from '../../features/user-auth/models/user-session.model';

interface LoginResponse {
	accessToken: string;
}

interface RefreshResponse {
	accessToken: string;
}

interface AuthClaims {
	userId?: string | number;
	sub?: string | number;
	id?: string | number;
	username?: string;
	role?: string;
	isFirstAccess?: boolean;
	firstAccess?: boolean;
}

@Injectable({ providedIn: 'root' })
export class InternalAuthService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = inject(API_BASE_URL);

	private readonly currentUser$ = new BehaviorSubject<UserSession | null>(null);
	private token: string | null = null;
	private restoreSessionInFlight$: Observable<boolean> | null = null;

	public login(username: string, password: string): Observable<UserSession> {
		return this.http
			.post<LoginResponse>(
				`${this.baseUrl}/auth/login`,
				{ username, password },
				{ withCredentials: true }
			)
			.pipe(map((response) => this.buildSessionFromAccessToken(response.accessToken)))
			.pipe(tap((session) => this.setSession(session)));
	}

	public setFirstAccessPassword(
		username: string,
		temporaryPassword: string,
		newPassword: string
	): Observable<void> {
		return this.http.post<void>(
			`${this.baseUrl}/auth/first-login`,
			{
				username,
				tempPassword: temporaryPassword,
				password: newPassword,
			},
			{ withCredentials: true }
		);
	}

	public refreshAccessToken(): Observable<string> {
		return this.http
			.post<RefreshResponse>(
				`${this.baseUrl}/auth/refresh`,
				{},
				{ withCredentials: true }
			)
			.pipe(map((response) => this.buildSessionFromAccessToken(response.accessToken)))
			.pipe(
				tap((session) => this.setSession(session)),
				map((session) => session.accessToken)
			);
	}

	public restoreSessionFromRefresh(): Observable<boolean> {
		if (this.isAuthenticated()) {
			return of(true);
		}

		this.restoreSessionInFlight$ ??= this.refreshAccessToken().pipe(
			map(() => true),
			catchError(() => of(false)),
			finalize(() => {
				this.restoreSessionInFlight$ = null;
			}),
			shareReplay(1)
		);

		return this.restoreSessionInFlight$;
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
		this.token = session.accessToken;
		this.currentUser$.next(session);
	}

	private buildSessionFromAccessToken(accessToken: string): UserSession {
		const claims = this.parseAccessToken(accessToken);
		const userId = claims.userId ?? claims.sub ?? claims.id;
		const isFirstAccess = claims.isFirstAccess ?? claims.firstAccess;

		if (userId === undefined || !claims.username || !claims.role || isFirstAccess === undefined) {
			throw new Error('Access token missing required auth claims');
		}

		if (!this.isUserRole(claims.role)) {
			throw new Error('Access token has invalid role claim');
		}

		return {
			userId: String(userId),
			username: claims.username,
			role: claims.role,
			accessToken,
			isFirstAccess,
		};
	}

	private parseAccessToken(accessToken: string): AuthClaims {
		const tokenSections = accessToken.split('.');
		if (tokenSections.length < 2) {
			throw new Error('Invalid access token format');
		}

		const base64Payload = tokenSections[1].replaceAll('-', '+').replaceAll('_', '/');
		const padLength = (4 - (base64Payload.length % 4)) % 4;
		const payload = atob(`${base64Payload}${'='.repeat(padLength)}`);

		return JSON.parse(payload) as AuthClaims;
	}

	private isUserRole(role: string): role is UserRole {
		return role === UserRole.AMMINISTRATORE || role === UserRole.OPERATORE_SANITARIO;
	}
}
