import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssignWardDialogComponent } from 'src/app/features/ward-management/components/assign-ward-dialog-component/assign-ward-dialog-component';

describe('AssignWardDialogComponent', () => {
  let component: AssignWardDialogComponent;
  let fixture: ComponentFixture<AssignWardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignWardDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignWardDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe resettare plantId a null in ngOnInit', () => {
    // Arrange: imposto un valore prima dell init
    component.form.controls.plantId.setValue('999');

    // Act: trigger lifecycle (ngOnInit)
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.plantId.value).toBeNull();
  });

  it('non dovrebbe emettere submitted se il form e invalido', () => {
    // Arrange
    fixture.detectChanges();
    const submittedSpy = vi.spyOn(component.submitted, 'emit');
    component.form.controls.plantId.setValue(null); // required -> invalid

    // Act
    component.onSubmit();

    // Assert
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.plantId.touched).toBe(true);
    expect(submittedSpy).not.toHaveBeenCalled();
  });

  it('dovrebbe emettere submitted con plantId quando il form e valido', () => {
    // Arrange
    fixture.detectChanges();
    const submittedSpy = vi.spyOn(component.submitted, 'emit');
    component.form.controls.plantId.setValue('101');

    // Act
    component.onSubmit();

    // Assert
    expect(submittedSpy).toHaveBeenCalledWith({ plantId: '101' });
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

