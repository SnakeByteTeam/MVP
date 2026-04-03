import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { AnalyticsDto } from '../models/analytics.model';
import { Observable, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
    private readonly http: HttpClient = inject(HttpClient);
    private readonly baseUrl: string = inject(API_BASE_URL);

    private readonly analyticsEndpoint = `${this.baseUrl}/`;

    public getAnalytics(apartmentId: string): Observable<AnalyticsDto>{

        const mock =  [
          {
            title: "Analisi Consumi Impianto",
            metric: "plant-consumption",
            unit: "Wh",
            labels: [
              "2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20", 
              "2026-03-21", "2026-03-22", "2026-03-23", "2026-03-24", "2026-03-25"
            ],
            series: [
              {
                id: "cons-01",
                name: "Consumo Energetico",
                data: [111.66, 40.83, 70, 56, 76, 23, 45, 92, 67]
              }
            ],
            suggestion:
              {
                message:[ 
                  "Spegni la luce, dai! Lorem ipsum sit dolor amet Spegni la luce, dai!",
                  "Spegni la luce, dai! Lorem ipsum sit dolor amet Spegni la luce, dai!Spegni la luce, dai! Lorem ipsum sit dolor amet Spegni la luce, dai!",
                  "Spegni la luce, dai! Lorem ipsum sit dolor amet Spegni la luce, dai!Spegni la luce, dai! Lorem ipsum sit dolor amet Spegni la luce, dai!",
                  "Spegni la luce, dai! Lorem ipsum sit dolor amet Spegni la luce, dai!Spegni la luce, dai! Lorem ipsum sit dolor amet Spegni la luce, dai!"


                ],
                isSuggestion: true
              }
            
          },
          {
            title: "Analisi Anomalie Impianto",
            metric: "plant-anomalies",
            unit: "anomalie",
            labels: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago"],
            series: [
              {
                id: "anomalies",
                name: "Anomalie Rilevate",
                data: [1, 0, 2, 1, 0, 3, 1, 0]
              }
            ],
            suggestion:
              {
                message:[],
                isSuggestion: false
              }
          },
          {
            title: "Analisi Presenze Prolungate",
            metric: "sensor-long-presence",
            unit: "eventi",
            labels: ["2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20", "2026-03-21", "2026-03-22"],
            series: [
              {
                id: "sensore-a",
                name: "Sensore Zona A",
                data: [1, 0, 1, 2, 0, 1]
              },
              {
                id: "sensore-b",
                name: "Sensore Zona B",
                data: [0, 1, 0, 1, 1, 0]
              }
            ],
            suggestion:
              {
                message:[],
                isSuggestion: false
              }
          },
          {
            title: "Analisi Presenza Sensori",
            metric: "sensor-presence",
            unit: "eventi",
            labels: ["2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20", "2026-03-21", "2026-03-22", "2026-03-23"],
            series: [
              {
                id: "pres-04",
                name: "Ingresso Principal",
                data: [1, 0, 0, 3, 2, 1, 0]
              },
              {
                id: "pres-03",
                name: "Area Relax",
                data: [1, 1, 1, 2, 2, 2, 1]
              }
            ],
            suggestion:
              {
                message:[],
                isSuggestion: false
              }
          },
          {
            title: "Analisi Temperatura Termostato",
            metric: "thermostat-temperature",
            unit: "°C",
            labels: ["2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20", "2026-03-21", "2026-03-22"],
            series: [
              {
                id: "temp-main",
                name: "Temperatura Media",
                data: [21.36, 21.66, 20.8, 21.2, 22.5, 20.1]
              }
            ],
            suggestion: 
              {
                message: [
                  "Verificare la presenza di un problema tecnico nel sistema di rilevamento della temperatura.",
                  "blablabalbal"
                ],
                isSuggestion: true
              }
          },
          {
            title: "Analisi Frequenza Allarmi Reparto",
            metric: "ward-alarms-frequency",
            unit: "allarmi",
            labels: ["2026-03-16", "2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20", "2026-03-21", "2026-03-22"],
            series: [
              {
                id: "ward-alarms",
                name: "Allarmi Generati",
                data: [2, 3, 1, 4, 2, 6, 3]
              }
            ],
            suggestion:
              {
                message:[],
                isSuggestion: false
              }
          },
          {
            title: "Analisi Cadute Reparto",
            metric: "ward-falls",
            unit: "cadute",
            labels: ["2026-03-18", "2026-03-19", "2026-03-20", "2026-03-21", "2026-03-22", "2026-03-23", "2026-03-24"],
            series: [
              {
                id: "ward-falls",
                name: "Incidenti Rilevati",
                data: [1, 3, 0, 1, 2, 0, 1]
              }
            ],
            suggestion:
              {
                message:[],
                isSuggestion: false
              }
          },
          {
            title: "Analisi Allarmi Risolti",
            metric: "ward-resolved-alarm",
            unit: "allarmi",
            labels: ["2026-03-16", "2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20", "2026-03-21"],
            series: [
              {
                id: "total",
                name: "Allarmi Totali",
                data: [2, 3, 1, 5, 4, 7]
              },
              {
                id: "resolved",
                name: "Allarmi Gestiti",
                data: [1, 2, 0, 4, 3, 6]
              }
            ],
            suggestion:
              {
                message:[],
                isSuggestion: false
              }
          }
        ];
        //return this.http.get<any[]>(analyticsEndpoint).pipe(

        return of(mock).pipe(
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


