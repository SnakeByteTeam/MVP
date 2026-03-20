import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class ApartmentApiService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl: string = inject(API_BASE_URL);
	private readonly apartmentsEndpoint = `${this.baseUrl}/api/apartments`;

	public enableApartment(apartmentId: string): Observable<void> {
		return this.http.patch<void>(
			`${this.apartmentsEndpoint}/${encodeURIComponent(apartmentId)}/enable`,
			{},
		);
	}

	public disableApartment(apartmentId: string): Observable<void> {
		return this.http.patch<void>(
			`${this.apartmentsEndpoint}/${encodeURIComponent(apartmentId)}/disable`,
			{},
		);
	}

}
