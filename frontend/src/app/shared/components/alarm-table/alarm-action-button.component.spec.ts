import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmActionButtonComponent } from './alarm-action-button.component';

describe('AlarmActionButtonComponent', () => {
    let fixture: ComponentFixture<AlarmActionButtonComponent>;
    let component: AlarmActionButtonComponent;

    const setInputs = (overrides?: { label?: string; ariaLabel?: string | null; tone?: 'neutral' | 'danger' | 'primary'; disabled?: boolean }): void => {
        fixture.componentRef.setInput('label', overrides?.label ?? 'GESTISCI');
        fixture.componentRef.setInput('ariaLabel', overrides?.ariaLabel ?? null);
        fixture.componentRef.setInput('tone', overrides?.tone ?? 'neutral');
        fixture.componentRef.setInput('disabled', overrides?.disabled ?? false);
        fixture.detectChanges();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlarmActionButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AlarmActionButtonComponent);
        component = fixture.componentInstance;
    });

    it('renderizza label e aria-label di fallback', () => {
        setInputs({ label: 'GESTISCI' });

        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

        expect(button.textContent).toContain('GESTISCI');
        expect(button.getAttribute('aria-label')).toBe('GESTISCI');
        expect(button.disabled).toBe(false);
    });

    it('usa aria-label esplicita quando presente', () => {
        setInputs({ label: 'GESTISCI', ariaLabel: 'Gestisci allarme Antipanico' });

        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

        expect(button.getAttribute('aria-label')).toBe('Gestisci allarme Antipanico');
    });

    it('applica la classe corretta per il tone primary', () => {
        setInputs({ tone: 'primary' });

        expect(component.buttonClass()).toContain('border-amber-300');
        expect(component.buttonClass()).toContain('bg-amber-300');
    });

    it('applica la classe corretta per il tone danger', () => {
        setInputs({ tone: 'danger' });

        expect(component.buttonClass()).toContain('border-red-600');
        expect(component.buttonClass()).toContain('bg-red-600');
    });

    it('non emette click quando disabilitato', () => {
        setInputs({ disabled: true });
        const emitSpy = vi.spyOn(component.pressed, 'emit');

        component.onPressed();

        expect(emitSpy).not.toHaveBeenCalled();
        expect((fixture.nativeElement.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
    });

    it('emette pressed al click quando abilitato', () => {
        setInputs();
        const emitSpy = vi.spyOn(component.pressed, 'emit');

        fixture.nativeElement.querySelector('button')?.dispatchEvent(new MouseEvent('click'));

        expect(emitSpy).toHaveBeenCalledTimes(1);
    });
});