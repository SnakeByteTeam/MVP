import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateUserFormComponent } from './create-user-form.component';

describe('CreateUserForm', () => {
  let component: CreateUserFormComponent;
  let fixture: ComponentFixture<CreateUserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUserFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submit emette formSubmit quando il form e valido', () => {
    const submitSpy = vi.spyOn(component.formSubmit, 'emit');
    component.form.setValue({
      firstName: 'Mario',
      lastName: 'Rossi',
      username: 'mrossi',
    });

    component.submit();

    expect(submitSpy).toHaveBeenCalledWith({
      firstName: 'Mario',
      lastName: 'Rossi',
      username: 'mrossi',
    });
    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  it('submit non emette e marca touched quando il form e invalido', () => {
    const submitSpy = vi.spyOn(component.formSubmit, 'emit');
    component.form.setValue({
      firstName: 'M',
      lastName: '',
      username: 'abc',
    });

    component.submit();

    expect(component.form.invalid).toBe(true);
    expect(component.form.controls['firstName'].touched).toBe(true);
    expect(component.form.controls['lastName'].touched).toBe(true);
    expect(component.form.controls['username'].touched).toBe(true);
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('applica validazioni required e minLength', () => {
    component.form.controls['firstName'].setValue('');
    component.form.controls['lastName'].setValue('R');
    component.form.controls['username'].setValue('abc');

    expect(component.form.controls['firstName'].hasError('required')).toBe(true);
    expect(component.form.controls['lastName'].hasError('minlength')).toBe(true);
    expect(component.form.controls['username'].hasError('minlength')).toBe(true);
  });

  it('reset pulisce il form', () => {
    component.form.setValue({
      firstName: 'Mario',
      lastName: 'Rossi',
      username: 'mrossi',
    });

    component.reset();

    expect(component.form.value).toEqual({
      firstName: '',
      lastName: '',
      username: '',
    });
  });
});
