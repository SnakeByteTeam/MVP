import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmToggleSwitchComponent } from 'src/app/shared/components/alarm-table/alarm-toggle-switch.component';

describe('AlarmToggleSwitchComponent', () => {
    let fixture: ComponentFixture<AlarmToggleSwitchComponent>;
    let component: AlarmToggleSwitchComponent;

    const setInputs = (checked = false, disabled = false, ariaLabel?: string): void => {
        fixture.componentRef.setInput('checked', checked);
        fixture.componentRef.setInput('disabled', disabled);
        if (ariaLabel !== undefined) {
            fixture.componentRef.setInput('ariaLabel', ariaLabel);
        }
        fixture.detectChanges();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlarmToggleSwitchComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AlarmToggleSwitchComponent);
        component = fixture.componentInstance;
    });

    it('mostra lo stato iniziale non attivo', () => {
        setInputs();

        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

        expect(button.getAttribute('aria-pressed')).toBe('false');
        expect(component.trackClass()).toContain('border-slate-500');
        expect(component.thumbClass()).toContain('translate-x-0.5');
    });

    it('mostra lo stato attivo e la classe corretta', () => {
        setInputs(true);

        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

        expect(button.getAttribute('aria-pressed')).toBe('true');
        expect(component.trackClass()).toContain('border-yellow-700');
        expect(component.thumbClass()).toContain('translate-x-4');
    });

    it('emette il nuovo valore quando viene togglato', () => {
        setInputs(false);
        const emitSpy = vi.spyOn(component.toggled, 'emit');

        component.onToggle();

        expect(emitSpy).toHaveBeenCalledWith(true);
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('non emette quando e disabilitato', () => {
        setInputs(true, true);
        const emitSpy = vi.spyOn(component.toggled, 'emit');

        component.onToggle();

        expect(emitSpy).not.toHaveBeenCalled();
        expect((fixture.nativeElement.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
    });

    it('usa aria-label custom quando fornita', () => {
        setInputs(false, false, 'Attiva allarme');

        expect((fixture.nativeElement.querySelector('button') as HTMLButtonElement).getAttribute('aria-label')).toBe('Attiva allarme');
    });
});