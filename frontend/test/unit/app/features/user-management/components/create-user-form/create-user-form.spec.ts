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

  it('il pannello form e nascosto quando isOpen=false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('[data-testid="create-user-panel"]');
    expect(panel.className).toContain('opacity-0');
  });

  it('il pannello form e visibile quando isOpen=true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('[data-testid="create-user-panel"]');
    expect(panel.className).toContain('opacity-100');
  });

  it('mostra bottone Inserisci Nuovo Operatore quando isOpen=false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.textContent).toContain('Inserisci Nuovo Operatore');
  });

  it('mostra bottone Chiudi quando isOpen=true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const closeBtn = buttons.find(b => b.textContent?.trim() === 'Chiudi');
    expect(closeBtn).toBeTruthy();
  });

  it('mostra messaggio errore USERNAME_ALREADY_IN_USE nel template', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('errorType', 'USERNAME_ALREADY_IN_USE');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Username già in uso');
  });

  it('mostra messaggio errore OTHER_ERROR nel template', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('errorType', 'OTHER_ERROR');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Errore durante la creazione utente');
  });

  it('mostra errori di validazione nome dopo submit invalido', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    component.form.controls['name'].setValue('');
    component.form.controls['surname'].setValue('Rossi');
    component.form.controls['username'].setValue('mrossi');
    component.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Il nome è obbligatorio');
  });

  it('mostra errori minlength cognome dopo submit invalido', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    component.form.controls['name'].setValue('Mario');
    component.form.controls['surname'].setValue('R');
    component.form.controls['username'].setValue('mrossi');
    component.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Il cognome deve essere di almeno 2 caratteri');
  });

  it('mostra errori minlength username dopo submit invalido', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    component.form.controls['name'].setValue('Mario');
    component.form.controls['surname'].setValue('Rossi');
    component.form.controls['username'].setValue('abc');
    component.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("L'username deve essere di almeno 4");
  });

  it('resetAndFocus resetta e pulisce lo stato del form', async () => {
    component.form.setValue({ name: 'Mario', surname: 'Rossi', username: 'mrossi' });
    component.form.markAllAsTouched();
    component.resetAndFocus();
    await new Promise<void>(resolve => queueMicrotask(() => resolve()));
    expect(component.form.untouched).toBe(true);
    expect(component.form.value).toEqual({ name: '', surname: '', username: '' });
  });
});
