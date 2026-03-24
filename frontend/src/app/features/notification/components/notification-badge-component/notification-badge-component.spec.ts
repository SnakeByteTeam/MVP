import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { NotificationBadgeComponent } from './notification-badge-component';

describe('NotificationBadgeComponent', () => {
  let component: NotificationBadgeComponent;
  let fixture: ComponentFixture<NotificationBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('nasconde il badge quando count e 0', () => {
    fixture.componentRef.setInput('count', 0);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.notification-badge');
    expect(badge).toBeNull();
  });

  it('mostra il badge quando count > 0 con testo e label accessibile', () => {
    fixture.componentRef.setInput('count', 3);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.notification-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('3');
    expect(badge.getAttribute('aria-label')).toBe('3 notifiche non lette');
  });

  it('normalizza valori negativi nascondendo il badge', () => {
    fixture.componentRef.setInput('count', -2);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.notification-badge');
    expect(badge).toBeNull();
  });

  it('limita la visualizzazione a 99+ per count elevati', () => {
    fixture.componentRef.setInput('count', 120);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.notification-badge');
    expect(badge.textContent.trim()).toBe('99+');
    expect(badge.getAttribute('aria-label')).toBe('120 notifiche non lette');
  });
});
