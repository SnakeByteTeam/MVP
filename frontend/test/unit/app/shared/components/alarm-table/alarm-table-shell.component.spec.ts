import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmTableShellComponent } from 'src/app/shared/components/alarm-table/alarm-table-shell.component';

@Component({
    standalone: true,
    template: `
        <app-alarm-table-shell
            [title]="'Allarmi attivi'"
            [caption]="'Tabella test'"
            [columns]="columns"
            [showCreateButton]="showCreateButton"
            [createButtonAriaLabel]="'Crea elemento'"
            (createRequested)="onCreateRequested()"
        >
            <tr><td>Contenuto proiettato</td></tr>
        </app-alarm-table-shell>
    `,
    imports: [AlarmTableShellComponent],
})
class HostComponent {
    public readonly columns = [
        { id: 'priority', label: 'Priorita' },
        { id: 'name', label: 'Nome' },
    ] as const;

    public showCreateButton = false;
    public readonly onCreateRequested = vi.fn();
}

describe('AlarmTableShellComponent', () => {
    let fixture: ComponentFixture<HostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(HostComponent);
    });

    it('renderizza intestazione, caption e contenuto proiettato', () => {
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;

        expect(nativeElement.textContent).toContain('Allarmi attivi');
        expect(nativeElement.querySelector('table')?.getAttribute('aria-label')).toBe('Tabella test');
        expect(nativeElement.textContent).toContain('Contenuto proiettato');
    });

    it('mostra il pulsante create e emette createRequested al click', () => {
        fixture.componentInstance.showCreateButton = true;
        fixture.detectChanges();

        const createButton = fixture.nativeElement.querySelector('button[aria-label="Crea elemento"]') as HTMLButtonElement | null;

        expect(createButton).not.toBeNull();

        createButton?.dispatchEvent(new MouseEvent('click'));

        expect(fixture.componentInstance.onCreateRequested).toHaveBeenCalledTimes(1);
    });
});