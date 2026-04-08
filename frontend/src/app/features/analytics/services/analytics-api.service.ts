import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { AnalyticsDto } from '../models/analytics.model';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  private analyticsEndpoint = "";
  private readonly apartmentsEndpoint = `${this.baseUrl}/plant/all`;

  public getAllApartments(): Observable<any[]> {


    return this.http.get<any[]>(this.apartmentsEndpoint).pipe(
      map(response => response.map(item => ({
        id: item.id,
        name: item.name,
      })))
    );
  }

  public getAnalytics(apartmentId: string, refresh: boolean = false): Observable<AnalyticsDto> {
    if(refresh){
      this.analyticsEndpoint = `${this.baseUrl}/analytics/${apartmentId}?refresh=true`;
    } else {
      this.analyticsEndpoint = `${this.baseUrl}/analytics/${apartmentId}`;
    }

    return this.http.get<any[]>(this.analyticsEndpoint).pipe(
      map((response: any[]) => {

        const analyticsInfo: any[] = response.map(item => ({
          title: item.title,
          metric: item.metric,
          unit: item.unit,
          labels: item.labels,
          datasets: item.series.map((s: any) => ({
            id: s.id,
            name: s.name,
            data: s.data
          })),
          suggestions: {
            messages: item.suggestion.message,
            isSuggestion: item.suggestion.isSuggestion
          }
        }));

        const result: AnalyticsDto = {
          apartmentId: apartmentId,
          analyticsInfo: analyticsInfo,
        };

        return result;
      })
    );
  }
}


