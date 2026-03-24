import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmItemComponent } from './alarm-item-component';

describe('AlarmItemComponent', () => {
  let component: AlarmItemComponent;
  let fixture: ComponentFixture<AlarmItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlarmItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlarmItemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
