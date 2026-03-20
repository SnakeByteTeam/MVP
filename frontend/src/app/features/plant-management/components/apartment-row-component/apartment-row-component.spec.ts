import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApartmentRowComponent } from './apartment-row-component';

describe('ApartmentRowComponent', () => {
  let component: ApartmentRowComponent;
  let fixture: ComponentFixture<ApartmentRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApartmentRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApartmentRowComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
