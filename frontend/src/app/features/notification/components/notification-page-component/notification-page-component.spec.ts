import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationPageComponent } from './notification-page-component';

describe('NotificationPageComponent', () => {
  let component: NotificationPageComponent;
  let fixture: ComponentFixture<NotificationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
