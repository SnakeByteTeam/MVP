import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationItemComponent } from './notification-item-component';

describe('NotificationItemComponent', () => {
  let component: NotificationItemComponent;
  let fixture: ComponentFixture<NotificationItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationItemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
