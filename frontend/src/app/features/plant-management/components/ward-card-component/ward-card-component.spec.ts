import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WardCardComponent } from './ward-card-component';

describe('WardCardComponent', () => {
  let component: WardCardComponent;
  let fixture: ComponentFixture<WardCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WardCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WardCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
