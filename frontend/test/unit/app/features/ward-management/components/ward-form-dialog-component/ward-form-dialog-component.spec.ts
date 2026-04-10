import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WardFormDialogComponent } from 'src/app/features/ward-management/components/ward-form-dialog-component/ward-form-dialog-component';

describe('WardFormDialogComponent', () => {
  let component: WardFormDialogComponent;
  let fixture: ComponentFixture<WardFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WardFormDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WardFormDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe precompilare il nome in edit mode', async () => {
    // Arrange
    fixture.componentRef.setInput('ward', {
      id: 1,
      name: 'Cardiologia',
      apartments: [],
      operators: [],
    });

    // Act
    fixture.detectChanges(); // trigger ngOnInit
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    expect(component.isEditMode()).toBe(true);
    expect(component.form.controls.name.value).toBe('Cardiologia');
  });


  it('non dovrebbe emettere submitted se nome vuoto', () => {

    //arrange
    fixture.detectChanges();
    const submittedSpy = vi.spyOn(component.submitted, 'emit');
    component.form.controls.name.setValue(''); //invalido perchè campo required

    //act
    component.onSubmit();

    //Assert
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.name.touched).toBe(true);
    expect(submittedSpy).not.toHaveBeenCalled();
  });

  it('non dovrebbe emettere submitted se il nome supera 100 caratteri', () => {
    // Arrange
    fixture.detectChanges();
    const submittedSpy = vi.spyOn(component.submitted, 'emit');

    component.form.controls.name.setValue('a'.repeat(101));

    // Act
    component.onSubmit();

    // Assert
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.name.errors?.['maxlength']).toBeTruthy();
    expect(submittedSpy).not.toHaveBeenCalled();
  });


  it('dovrebbe emettere submitted con nome trimmato se form valido', () => {
    fixture.detectChanges();
    const submittedSpy = vi.spyOn(component.submitted, 'emit');
    component.form.controls.name.setValue('    Psicopazzia  ');

    //act
    component.onSubmit();

    //assert
    expect(submittedSpy).toHaveBeenCalledWith({ name: 'Psicopazzia' });
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
