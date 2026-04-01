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

        const mock = [
        
            {
                title: "Plant Consumption Analytics",
                metric: "plant-consumption",
                unit: "Wh",
                labels: [
                "2026-03-17",
                "2026-03-18",
                "2026-03-19",
                "2026-03-20",
                "2026-03-21",
                "2026-03-22"
                ],
                series: [
                {
                    id: "",
                    name: "",
                    data: [
                    111.66666666666667,
                    40.833333333333336,
                    70,
                    56,
                    76,
                    23
                    ]
                }
                ],
                suggestion: {
                message: "Spegni a luce valà",
                isSuggestion: true
                }
            },
            {
                title: "Plant Anomalies Analytics",
                metric: "plant-anomalies",
                unit: "anomalies",
                labels: [
                "Total"
                ],
                series: [
                {
                    id: "anomalies",
                    name: "Anomalies Detected",
                    data: [
                    1
                    ]
                }
                ],
                suggestion: {
                message: "",
                isSuggestion: false
                }
            },
            {
                title: "Sensor Long Presence Analytics",
                metric: "sensor-long-presence",
                unit: "events",
                labels: [
                "2026-03-17",
                "2026-03-18"
                ],
                series: [
                {
                    id: "dp-AA0011BB0011-1000000004-SFE_State_Presence",
                    name: "dp-AA0011BB0011-1000000004-SFE_State_Presence",
                    data: [
                    1,
                    0
                    ]
                },
                {
                    id: "dp-AA0011BB0011-1000000003-SFE_State_Presence",
                    name: "dp-AA0011BB0011-1000000003-SFE_State_Presence",
                    data: [
                    0,
                    1
                    ]
                }
                ],
                suggestion: {
                message: "",
                isSuggestion: false
                }
            },
            {
                title: "Sensor Presence Analytics",
                metric: "sensor-presence",
                unit: "events",
                labels: [
                "2026-03-17",
                "2026-03-18",
                "2026-03-19"
                ],
                series: [
                {
                    id: "dp-AA0011BB0011-1000000004-SFE_State_Presence",
                    name: "dp-AA0011BB0011-1000000004-SFE_State_Presence",
                    data: [
                    1,
                    0,
                    0
                    ]
                },
                {
                    id: "dp-AA0011BB0011-1000000003-SFE_State_Presence",
                    name: "dp-AA0011BB0011-1000000003-SFE_State_Presence",
                    data: [
                    1,
                    1,
                    1
                    ]
                }
                ],
                suggestion: {
                message: "",
                isSuggestion: false
                }
            },
            {
                title: "Plant Thermostat Temperature Analytics",
                metric: "thermostat-temperature",
                unit: "°C",
                labels: [
                "2026-03-17",
                "2026-03-18",
                "2026-03-19"
                ],
                series: [
                {
                    id: "",
                    name: "",
                    data: [
                    21.366666666666667,
                    21.6625,
                    20.8
                    ]
                }
                ],
                suggestion: {
                message: "Verificare la presenza di un problema tecnico nel sistema di rilevamento della temperatura.",
                isSuggestion: true
                }
            },
            {
                title: "Ward Alarms Frequency Analytics",
                metric: "ward-alarms-frequency",
                unit: "alarms",
                labels: [
                "2026-03-16",
                "2026-03-17",
                "2026-03-18"
                ],
                series: [
                {
                    id: "ward-alarms",
                    name: "Alarms",
                    data: [
                    2,
                    3,
                    1
                    ]
                }
                ],
                suggestion: {
                message: "",
                isSuggestion: false
                }
            },
            {
                title: "Ward Falls Analytics",
                metric: "ward-falls",
                unit: "falls",
                labels: [
                "2026-03-18",
                "2026-03-19",
                "2026-03-20",
                "2026-03-21"
                ],
                series: [
                {
                    id: "ward-falls",
                    name: "Falls",
                    data: [
                    1,
                    3,
                    0,
                    1
                    ]
                }
                ],
                suggestion: {
                message: "",
                isSuggestion: false
                }
            },
            {
                title: "Ward Resolved Alarm Analytics",
                metric: "ward-resolved-alarm",
                unit: "alarms",
                labels: [
                "2026-03-16",
                "2026-03-17",
                "2026-03-18"
                ],
                series: [
                {
                    id: "total",
                    name: "Total Alarms",
                    data: [
                    2,
                    3,
                    1
                    ]
                },
                {
                    id: "resolved",
                    name: "Resolved Alarms",
                    data: [
                    1,
                    2,
                    0
                    ]
                }
                ],
                suggestion: {
                message: "",
                isSuggestion: false
                }
            }
        ]

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
                suggestion: {
                description: item.suggestion.message,
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


