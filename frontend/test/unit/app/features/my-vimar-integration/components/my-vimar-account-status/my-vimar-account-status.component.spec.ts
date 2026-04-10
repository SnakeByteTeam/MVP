import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MyVimarAccountStatusComponent } from 'src/app/features/my-vimar-integration/components/my-vimar-account-status/my-vimar-account-status.component';

describe('MyVimarAccountStatusComponent', () => {
  let component: MyVimarAccountStatusComponent;
  let fixture: ComponentFixture<MyVimarAccountStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyVimarAccountStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyVimarAccountStatusComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('account', { email: '', isLinked: false });
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('mostra pulsante di collegamento quando account non collegato', () => {
    fixture.componentRef.setInput('account', { email: '', isLinked: false });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Nessun account MyVimar collegato.');
    expect(text).toContain('Collega account MyVimar');
  });

  it('mostra email e pulsante di rimozione quando account collegato', () => {
    fixture.componentRef.setInput('account', { email: 'admin@example.com', isLinked: true });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('admin@example.com');
    expect(text).toContain('Rimuovi account');
  });

  it('emette linkClicked quando viene premuto il pulsante collega', () => {
    const emitSpy = vi.spyOn(component.linkClicked, 'emit');
    fixture.componentRef.setInput('account', { email: '', isLinked: false });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('emette unlinkClicked quando viene premuto il pulsante rimuovi', () => {
    const emitSpy = vi.spyOn(component.unlinkClicked, 'emit');
    fixture.componentRef.setInput('account', { email: 'admin@example.com', isLinked: true });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});
