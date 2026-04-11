import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { DashboardComponent } from 'src/app/features/dashboard/components/dashboard-page/dashboard-page.component';
import { AnalyticsWidgetComponent } from 'src/app/features/dashboard/components/analytics-widget/analytics-widget.component';
import { AlarmWidgetComponent } from 'src/app/features/dashboard/components/alarms-widget/alarms-widget.component';

@Component({ selector: 'app-alarms-widget', standalone: true, template: '<div>Fake Alarm Widget</div>' })
class FakeAlarmWidgetComponent {}

@Component({ selector: 'app-analytics-widget', standalone: true, template: '<div>Fake Analytics Widget</div>' })
class FakeAnalyticsWidgetComponent {}

describe('Dashboard feature integration', () => {
    let fixture: ComponentFixture<DashboardComponent>;
    let component: DashboardComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
        })
            .overrideComponent(DashboardComponent, {
                remove: { imports: [AnalyticsWidgetComponent, AlarmWidgetComponent] },
                add: { imports: [FakeAnalyticsWidgetComponent, FakeAlarmWidgetComponent] },
            })
            .compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('TBD-RF renderizza la dashboard', () => {
        expect(component).toBeTruthy();
    });

    it('TBD-RF visualizza widget allarmi', () => {
        expect(fixture.debugElement.query(By.css('app-alarms-widget'))).not.toBeNull();
    });

    it('TBD-RF visualizza widget analytics', () => {
        expect(fixture.debugElement.query(By.css('app-analytics-widget'))).not.toBeNull();
    });
});
