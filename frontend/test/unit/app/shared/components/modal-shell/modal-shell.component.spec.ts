import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalShellComponent } from 'src/app/shared/components/modal-shell/modal-shell.component';

describe('ModalShellComponent', () => {
    let fixture: ComponentFixture<ModalShellComponent>;
    let component: ModalShellComponent;

    const setInputs = (open = false, description: string | null = null): void => {
        fixture.componentRef.setInput('open', open);
        fixture.componentRef.setInput('title', 'Finestra test');
        fixture.componentRef.setInput('description', description);
        fixture.componentRef.setInput('closeLabel', 'Chiudi finestra test');
        fixture.detectChanges();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ModalShellComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ModalShellComponent);
        component = fixture.componentInstance;
    });

    it('non renderizza il dialog quando open e false', () => {
        setInputs(false);

        expect(fixture.nativeElement.querySelector('dialog')).toBeNull();
    });

    it('renderizza il dialog e la descrizione quando open e true', () => {
        setInputs(true, 'Descrizione di test');

        const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement | null;

        expect(dialog).not.toBeNull();
        expect(dialog?.getAttribute('aria-describedby')).toBe('app-modal-shell-description');
        expect(fixture.nativeElement.textContent).toContain('Finestra test');
        expect(fixture.nativeElement.textContent).toContain('Descrizione di test');
    });

    it('non espone aria-describedby quando la descrizione e nulla', () => {
        setInputs(true, null);

        expect((fixture.nativeElement.querySelector('dialog') as HTMLDialogElement | null)?.getAttribute('aria-describedby')).toBeNull();
    });

    it('emette closed al click sul pulsante di chiusura', () => {
        setInputs(true, 'Descrizione di test');
        const emitSpy = vi.spyOn(component.closed, 'emit');

        fixture.nativeElement.querySelector('button')?.dispatchEvent(new MouseEvent('click'));

        expect(emitSpy).toHaveBeenCalledTimes(1);
    });
});