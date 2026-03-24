import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmPageManagementComponent } from './alarm-page-management-component';

describe('AlarmPageManagementComponent', () => {
  let component: AlarmPageManagementComponent;
  let fixture: ComponentFixture<AlarmPageManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlarmPageManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlarmPageManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
