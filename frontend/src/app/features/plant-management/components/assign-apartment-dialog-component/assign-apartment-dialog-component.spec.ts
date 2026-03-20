import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignApartmentDialogComponent } from './assign-apartment-dialog-component';

describe('AssignApartmentDialogComponent', () => {
  let component: AssignApartmentDialogComponent;
  let fixture: ComponentFixture<AssignApartmentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignApartmentDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignApartmentDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
