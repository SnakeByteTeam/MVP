import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe resettare apartmentId a stringa vuota in ngOnInit', () => {
    // Arrange: imposto un valore prima dell init
    component.form.controls.apartmentId.setValue('apt-99');

    // Act: trigger lifecycle (ngOnInit)
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.apartmentId.value).toBe('');
  });

  it('non dovrebbe emettere submitted se il form e invalido', () => {
    // Arrange
    fixture.detectChanges();
    const submittedSpy = vi.spyOn(component.submitted, 'emit');
    component.form.controls.apartmentId.setValue(''); // required -> invalid

    // Act
    component.onSubmit();

    // Assert
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.apartmentId.touched).toBe(true);
    expect(submittedSpy).not.toHaveBeenCalled();
  });

  it('dovrebbe emettere submitted con apartmentId quando il form e valido', () => {
    // Arrange
    fixture.detectChanges();
    const submittedSpy = vi.spyOn(component.submitted, 'emit');
    component.form.controls.apartmentId.setValue('apt-1');

    // Act
    component.onSubmit();

    // Assert
    expect(submittedSpy).toHaveBeenCalledWith({ apartmentId: 'apt-1' });
    expect(submittedSpy).toHaveBeenCalledTimes(1);
  });

  it('dovrebbe emettere cancelled quando onCancel viene chiamato', () => {
    // Arrange
    const cancelledSpy = vi.spyOn(component.cancelled, 'emit');

    // Act
    component.onCancel();

    // Assert
    expect(cancelledSpy).toHaveBeenCalledTimes(1);
  });
});

