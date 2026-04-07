import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { DashboardComponent } from './dashboard-page.component';
import { AnalyticsWidgetComponent } from '../analytics-widget/analytics-widget.component';
import { AlarmWidgetComponent } from '../alarms-widget/alarms-widget.component';

// 1. Creiamo dei "Fake Components" molto semplici con lo stesso selettore
// Questo serve a non caricare la logica (e i servizi) dei componenti reali
@Component({
  selector: 'app-alarms-widget',
  standalone: true,
  template: '<div>Fake Alarm Widget</div>'
})
class FakeAlarmWidgetComponent {}

@Component({
  selector: 'app-analytics-widget',
  standalone: true,
  template: '<div>Fake Analytics Widget</div>'
})
class FakeAnalyticsWidgetComponent {}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
    })
    // 2. Usiamo overrideComponent per sostituire i componenti reali con i fake
    .overrideComponent(DashboardComponent, {
      remove: { imports: [AnalyticsWidgetComponent, AlarmWidgetComponent] },
      add: { imports: [FakeAnalyticsWidgetComponent, FakeAlarmWidgetComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('dovrebbe creare il componente dashboard', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe renderizzare il widget degli allarmi tramite il selettore', () => {
    const alarmWidget = fixture.debugElement.query(By.css('app-alarms-widget'));
    expect(alarmWidget).not.toBeNull();
  });

  it('dovrebbe renderizzare il widget degli analytics tramite il selettore', () => {
    const analyticsWidget = fixture.debugElement.query(By.css('app-analytics-widget'));
    expect(analyticsWidget).not.toBeNull();
  });
});