import { ChartInfoDto } from "../models/chart-info.model";
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { SimpleChanges, Directive, Input } from "@angular/core";


@Directive()
export abstract class ChartComponent {

    @Input() chartInfo!: ChartInfoDto;
    abstract chartType: ChartType;
    abstract description: string;
    @Input() showSuggestions!: boolean;
    protected fillArea: boolean = false;
    
    renderedChartData: ChartData = {
        labels: [],
        datasets: []
    };

    chartOptions: ChartConfiguration['options'] = {
        responsive: true,
        scales: {
            y: { beginAtZero: true }
        }
    };

    chartColors = [
        { bg: 'rgba(68, 119, 239, 0.5)', border: 'rgb(68, 239, 236)' },
        { bg: 'rgba(34, 197, 94, 0.5)', border: 'rgb(34, 197, 94)' }
    ];



    ngOnChanges(changes: SimpleChanges): void {
        console.log("i grafici stanno cambiando, dati ricevuti:");
        if (changes['chartInfo'] && this.chartInfo) {
            console.log("Contenuto chartInfo JSON:", JSON.stringify(this.chartInfo, null, 2));
            this.updateChart(this.chartInfo);
        }
    }

    protected updateChart(data: ChartInfoDto): void {
        const defaultColor = { bg: 'rgba(68, 119, 239, 0.5)', border: 'rgb(68, 225, 239)' };
        this.renderedChartData = {
            labels: data.labels,
            datasets: data.datasets.map((ds,index) => {
            const color = this.chartColors[index] ?? defaultColor;
            return{
                data: ds.data,
                label: ds.name, 
                backgroundColor: color.bg, 
                borderColor: color.border,
                borderWidth: 1, 
                fill: this.fillArea, 
                tension: 0.2
            };
            })
        };

        // 2. Aggiorna le opzioni per includere l'unità di misura (unit)
    this.chartOptions = {
            ...this.chartOptions,
            scales: {
                ...this.chartOptions?.scales,
                y: {
                    ...this.chartOptions?.scales?.['y'],
                    beginAtZero: true,
                    // RIMUOVIAMO il callback dai ticks se non vuoi l'unità su ogni numero
                    ticks: {
                        ...this.chartOptions?.scales?.['y']?.ticks,
                    },
                    // AGGIUNGIAMO il titolo dell'asse
                    title: {
                        display: true,
                        text: data.unit, // Mostra l'unità (es. "kWh") in cima o a lato
                        color: '#64748b', // Colore slate-500 per coerenza con Tailwind
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        padding: { bottom: 10 }
                    }
                }
            },
            plugins: {
                ...this.chartOptions?.plugins,
                tooltip: {
                    callbacks: {
                        // Ti consiglio di LASCIRE l'unità nel tooltip, perché lì è molto utile
                        label: (context) => `${context.dataset.label}: ${context.parsed.y} ${data.unit}`
                    }
                }
            }
        };


    }
}
