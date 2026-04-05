import { Component, Input  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlantDto } from '../../../apartment-monitor/models/plant-response.model';

@Component({ 
    selector: 'plant-overview', 
    standalone: true, 
    imports: [
        CommonModule,
    ],
    templateUrl: './plant-overview.component.html' })
export class plantOverviewComponent{
    @Input() apartment!: PlantDto | null ;
}    