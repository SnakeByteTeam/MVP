import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApartmentApiService } from 'src/app/features/apartment-monitor/services/apartment-api.service';
import { UserRole } from 'src/app/core/models/user-role.enum';
import type { Ward } from 'src/app/features/ward-management/models/ward.model';
import { AssignmentOperationsService } from 'src/app/features/ward-management/services/assignment-operations.service';
import { WardApiService } from 'src/app/features/ward-management/services/ward-api.service';
import { WardManagementStore } from 'src/app/features/ward-management/services/ward-management.store';
import { WardOperationsService } from 'src/app/features/ward-management/services/ward-operations.service';
import { WardStore } from 'src/app/features/ward-management/services/ward.store';
import { AssignOperatorDialogComponent } from 'src/app/features/ward-management/components/assign-operator-dialog-component/assign-operator-dialog-component';
import { AssignWardDialogComponent } from 'src/app/features/ward-management/components/assign-ward-dialog-component/assign-ward-dialog-component';
import { WardManagementPageComponent } from 'src/app/features/ward-management/components/ward-management-page-component/ward-management-page-component';

describe('WardManagement feature integration', () => {
    let fixture: ComponentFixture<WardManagementPageComponent>;

    const initialWardList = [
        { id: 1, name: 'Cardiologia' },
        { id: 2, name: 'Neurologia' },
    ];

    const ward1: Ward = {
        id: 1,
        name: 'Cardiologia',
        apartments: [{ id: '101', name: 'App. 101' }],
        operators: [
            {
                id: 1,
                firstName: 'mrossi',
                lastName: '',
                username: 'mrossi',
                role: UserRole.OPERATORE_SANITARIO,
            },
        ],
    };

    const ward2: Ward = {
        id: 2,
        name: 'Neurologia',
        apartments: [{ id: '102', name: 'App. 102' }],
        operators: [],
    };

    const ward3: Ward = {
        id: 3,
        name: 'Oncologia',
        apartments: [],
        operators: [],
    };

    const wardApiStub = {
        getWards: vi.fn(),
        getPlantsByWardId: vi.fn(),
        getOperatorsByWardId: vi.fn(),
        getAvailableOperators: vi.fn(),
        getAvailablePlants: vi.fn(),
        createWard: vi.fn(),
        updateWard: vi.fn(),
        deleteWard: vi.fn(),
        assignOperatorToWard: vi.fn(),
        removeOperatorFromWard: vi.fn(),
        assignPlantToWard: vi.fn(),
        removePlantFromWard: vi.fn(),
    };

    const apartmentApiStub = {
        enableApartment: vi.fn(),
        disableApartment: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wardApiStub.getWards.mockReturnValue(of(initialWardList));
        wardApiStub.getPlantsByWardId.mockImplementation((wardId: number) => {
            if (wardId === 1) {
                return of(ward1.apartments);
            }

            return of(ward2.apartments);
        });
        wardApiStub.getOperatorsByWardId.mockImplementation((wardId: number) => {
            if (wardId === 1) {
                return of([{ id: 1, username: 'mrossi' }]);
            }

            return of([]);
        });
        wardApiStub.getAvailableOperators.mockReturnValue(
            of([
                { id: 2, username: 'lverdi' },
            ]),
        );
        wardApiStub.createWard.mockReturnValue(of({ id: 3, name: 'Oncologia' } as unknown as Ward));
        wardApiStub.updateWard.mockReturnValue(of({ id: 1, name: 'Cardiologia A' } as unknown as Ward));
        wardApiStub.deleteWard.mockReturnValue(of(void 0));
        wardApiStub.assignOperatorToWard.mockReturnValue(of(void 0));
        wardApiStub.removeOperatorFromWard.mockReturnValue(of(void 0));
        wardApiStub.assignPlantToWard.mockReturnValue(of(void 0));
        wardApiStub.removePlantFromWard.mockReturnValue(of(void 0));
        wardApiStub.getAvailablePlants.mockReturnValue(of([]));

        apartmentApiStub.enableApartment.mockReturnValue(of(void 0));
        apartmentApiStub.disableApartment.mockReturnValue(of(void 0));

        await TestBed.configureTestingModule({
            imports: [WardManagementPageComponent],
            providers: [
                WardStore,
                WardOperationsService,
                AssignmentOperationsService,
                WardManagementStore,
                { provide: WardApiService, useValue: wardApiStub },
                { provide: ApartmentApiService, useValue: apartmentApiStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WardManagementPageComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    function getWardButtons(): HTMLButtonElement[] {
        return Array.from(
            (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('aside[aria-label="Elenco reparti"] ul button'),
        );
    }

    function getDialog(): HTMLElement | null {
        return (fixture.nativeElement as HTMLElement).querySelector('dialog');
    }

    function setInputValue(selector: string, value: string): void {
        const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(selector);
        expect(input).not.toBeNull();
        if (!input) {
            return;
        }

        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
    }

    function clickButtonByText(text: string): void {
        const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'));
        const button = buttons.find((item) => item.textContent?.includes(text));
        expect(button).toBeTruthy();
        button?.click();
        fixture.detectChanges();
    }

    function clickButtonByAriaLabel(label: string): void {
        const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
        expect(button).not.toBeNull();
        button?.click();
        fixture.detectChanges();
    }

    it('RF27-OBL mantiene coerente la selezione del ward e aggiorna il nome in entrambe le sezioni', () => {
        const nativeElement = fixture.nativeElement as HTMLElement;

        expect(wardApiStub.getWards).toHaveBeenCalledTimes(1);
        expect(nativeElement.querySelector('section[aria-label="Dettagli reparto e appartamenti"] h2')?.textContent).toContain(ward1.name);

        const wardButtons = getWardButtons();
        expect(wardButtons.length).toBe(2);

        wardButtons[1].click();
        fixture.detectChanges();

        expect(nativeElement.querySelector('section[aria-label="Dettagli reparto e appartamenti"] h2')?.textContent).toContain(ward2.name);
    });

    it('RF28-OBL aggiorna il nome del ward e sincronizza lista e pannello centrale', () => {
        const nativeElement = fixture.nativeElement as HTMLElement;

        expect(nativeElement.querySelector('section[aria-label="Dettagli reparto e appartamenti"] h2')?.textContent).toContain(ward1.name);

        clickButtonByText('Modifica');
        expect(getDialog()?.textContent).toContain('Modifica reparto');

        setInputValue('#ward-name', 'Cardiologia A');
        clickButtonByText('Salva');

        expect(wardApiStub.updateWard).toHaveBeenCalledWith(1, { name: 'Cardiologia A' });
        fixture.detectChanges();

        expect(nativeElement.querySelector('section[aria-label="Dettagli reparto e appartamenti"] h2')?.textContent).toContain('Cardiologia A');
        expect(getWardButtons()[0].textContent).toContain('Cardiologia A');
    });

    it('RF29-OBL dopo la creazione mantiene cliccabile il ward appena creato', () => {
        const nativeElement = fixture.nativeElement as HTMLElement;

        clickButtonByText('Nuovo reparto');
        expect(getDialog()?.textContent).toContain('Crea reparto');

        setInputValue('#ward-name', 'Oncologia');
        clickButtonByText('Crea');

        expect(wardApiStub.createWard).toHaveBeenCalledWith({ name: 'Oncologia' });
        fixture.detectChanges();

        const wardButtons = getWardButtons();
        expect(wardButtons.length).toBe(3);
        expect(wardButtons[2].textContent).toContain('Oncologia');

        wardButtons[2].click();
        fixture.detectChanges();

        expect(nativeElement.querySelector('section[aria-label="Dettagli reparto e appartamenti"] h2')?.textContent).toContain('Oncologia');
        expect(wardButtons[2].textContent).toContain(ward3.name);
    });

    it('RF30-OBL assegna un operatore dal dialog e invoca il flusso di assegnazione', () => {
        clickButtonByText('Aggiungi operatore');

        expect(getDialog()?.textContent).toContain('Assegna operatore sanitario');
        expect(wardApiStub.getAvailableOperators).toHaveBeenCalledTimes(1);

        const assignOperatorDialog = fixture.debugElement.query(By.directive(AssignOperatorDialogComponent));
        expect(assignOperatorDialog).toBeTruthy();
        const assignOperatorComponent = assignOperatorDialog.componentInstance as AssignOperatorDialogComponent;
        assignOperatorComponent.form.controls.userId.setValue(1);
        assignOperatorComponent.onSubmit();
        fixture.detectChanges();

        expect(wardApiStub.assignOperatorToWard).toHaveBeenCalledWith(1, { userId: 1 });
        expect((fixture.nativeElement as HTMLElement).querySelector('#operator-id')).toBeNull();
    });

    it('RF31-OBL non mostra appartamenti assegnabili se fetch disponibile fallisce', () => {
        wardApiStub.getAvailablePlants.mockReturnValueOnce(throwError(() => new Error('network error')));

        clickButtonByText('Assegna appartamento');
        expect(getDialog()?.textContent).toContain('Assegna appartamento');
        expect(wardApiStub.getAvailablePlants).toHaveBeenCalledTimes(1);

        const apartmentOptions = Array.from(
            (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLOptionElement>('#apartment-id option'),
        ).map((option) => option.textContent?.trim() ?? '');

        expect(apartmentOptions).not.toContain('App. 102');
        expect(apartmentOptions).not.toContain('App. 101');

        const assignPlantDialog = fixture.debugElement.query(By.directive(AssignWardDialogComponent));
        expect(assignPlantDialog).toBeTruthy();
        const assignPlantComponent = assignPlantDialog.componentInstance as AssignWardDialogComponent;
        assignPlantComponent.form.controls.plantId.setValue('102');
        assignPlantComponent.onSubmit();
        fixture.detectChanges();

        expect(wardApiStub.assignPlantToWard).toHaveBeenCalledWith(1, { plantId: '102' });
        expect((fixture.nativeElement as HTMLElement).querySelector('#apartment-id')).toBeNull();
    });

    it('RF32-OBL rimuove operatore e appartamento passando dal confirm dialog', () => {
        clickButtonByAriaLabel('Rimuovi operatore');
        expect(getDialog()?.textContent).toContain('rimozione dell\'operatore');
        clickButtonByText('Rimuovi');
        expect(wardApiStub.removeOperatorFromWard).toHaveBeenCalledWith(1, 1);

        clickButtonByAriaLabel('Rimuovi appartamento');
        expect(getDialog()?.textContent).toContain('rimozione dell\'appartamento');
        clickButtonByText('Rimuovi');
        expect(wardApiStub.removePlantFromWard).toHaveBeenCalledWith(1, '101');
    });

    it('RF33-OBL elimina un ward dopo conferma e aggiorna la selezione', () => {
        const nativeElement = fixture.nativeElement as HTMLElement;

        clickButtonByText('Elimina');
        expect(getDialog()?.textContent).toContain('eliminazione del reparto');
        clickButtonByText('Conferma');

        expect(wardApiStub.deleteWard).toHaveBeenCalledWith(1);
        expect(getWardButtons().length).toBe(1);
        expect(nativeElement.querySelector('section[aria-label="Dettagli reparto e appartamenti"] h2')?.textContent).toContain(ward2.name);
    });
});
