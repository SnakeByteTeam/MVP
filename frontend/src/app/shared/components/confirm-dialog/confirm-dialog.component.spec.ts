import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
    let fixture: ComponentFixture<ConfirmDialogComponent>;
    let component: ConfirmDialogComponent;

    const setInputs = (message?: string, confirmLabel?: string, cancelLabel?: string): void => {
        if (message !== undefined) {
            fixture.componentRef.setInput('message', message);
        }
        if (confirmLabel !== undefined) {
            fixture.componentRef.setInput('confirmLabel', confirmLabel);
        }
        if (cancelLabel !== undefined) {
            fixture.componentRef.setInput('cancelLabel', cancelLabel);
        }

        fixture.detectChanges();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfirmDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmDialogComponent);
        component = fixture.componentInstance;
    });

    it('renderizza i valori di default', () => {
        setInputs();

        const nativeElement = fixture.nativeElement as HTMLElement;

        expect(nativeElement.textContent).toContain('Confermi questa operazione?');
        expect(nativeElement.textContent).toContain('Conferma');
        expect(nativeElement.textContent).toContain('Annulla');
    });

    it('emette confirmed e cancelled ai click corretti', () => {
        setInputs('Sei sicuro?');
        const confirmedSpy = vi.spyOn(component.confirmed, 'emit');
        const cancelledSpy = vi.spyOn(component.cancelled, 'emit');

        const buttons = fixture.nativeElement.querySelectorAll('button');
        (buttons.item(0) as HTMLButtonElement).dispatchEvent(new MouseEvent('click'));
        (buttons.item(1) as HTMLButtonElement).dispatchEvent(new MouseEvent('click'));

        expect(cancelledSpy).toHaveBeenCalledTimes(1);
        expect(confirmedSpy).toHaveBeenCalledTimes(1);
    });

    it('supporta label personalizzate', () => {
        setInputs('Procedere con la cancellazione?', 'Sì, elimina', 'No, torna indietro');

        const nativeElement = fixture.nativeElement as HTMLElement;

        expect(nativeElement.textContent).toContain('Procedere con la cancellazione?');
        expect(nativeElement.textContent).toContain('Sì, elimina');
        expect(nativeElement.textContent).toContain('No, torna indietro');
    });
});