import { ChartInfoDto } from "../models/chart-info.model";
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { SimpleChanges, Directive, Input } from "@angular/core";

@Directive()
export abstract class ChartComponent {

    @Input() chartInfo!: ChartInfoDto;
    abstract chartType: ChartType;
    
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

    showSuggestions: boolean = true;


    ngOnChanges(changes: SimpleChanges): void {
        if (changes['chartInfo'] && this.chartInfo) {
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
            };
            })
        };
    }

    public showHideSugg(){this.showSuggestions = !this.showSuggestions;}
}
