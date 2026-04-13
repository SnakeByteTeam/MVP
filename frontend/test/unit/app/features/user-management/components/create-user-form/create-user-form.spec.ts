import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateUserFormComponent } from 'src/app/features/user-management/components/create-user-form/create-user-form.component';

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
      name: 'Mario',
      surname: 'Rossi',
      username: 'mrossi',
    });

    component.submit();

    expect(submitSpy).toHaveBeenCalledWith({
      name: 'Mario',
      surname: 'Rossi',
      username: 'mrossi',
    });
    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  it('submit non emette e marca touched quando il form e invalido', () => {
    const submitSpy = vi.spyOn(component.formSubmit, 'emit');
    component.form.setValue({
      name: 'M',
      surname: '',
      username: 'abc',
    });

    component.submit();

    expect(component.form.invalid).toBe(true);
    expect(component.form.controls['name'].touched).toBe(true);
    expect(component.form.controls['surname'].touched).toBe(true);
    expect(component.form.controls['username'].touched).toBe(true);
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('applica validazioni required e minLength', () => {
    component.form.controls['name'].setValue('');
    component.form.controls['surname'].setValue('R');
    component.form.controls['username'].setValue('abc');

    expect(component.form.controls['name'].hasError('required')).toBe(true);
    expect(component.form.controls['surname'].hasError('minlength')).toBe(true);
    expect(component.form.controls['username'].hasError('minlength')).toBe(true);
  });

  it('reset pulisce il form', () => {
    component.form.setValue({
      name: 'Mario',
      surname: 'Rossi',
      username: 'mrossi',
    });

    component.reset();

    expect(component.form.value).toEqual({
      name: '',
      surname: '',
      username: '',
    });
  });

  it('requestClose emette closeRequest', () => {
    const closeSpy = vi.spyOn(component.closeRequest, 'emit');

    component.requestClose();

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('requestOpen emette openRequest', () => {
    const openSpy = vi.spyOn(component.openRequest, 'emit');

    component.requestOpen();

    expect(openSpy).toHaveBeenCalledTimes(1);
  });
});
