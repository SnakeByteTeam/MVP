import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsWidgetComponent } from '../analytics-widget/analytics-widget.component';
import { AlarmWidgetComponent } from '../alarms-widget/alarms-widget.component';

@Component({ 
    selector: 'app-dashboard', 
    standalone: true, 
    imports: [
        CommonModule,
        AnalyticsWidgetComponent,
        AlarmWidgetComponent
    ],
    templateUrl: './dashboard-page.component.html' })
export class DashboardComponent{}



