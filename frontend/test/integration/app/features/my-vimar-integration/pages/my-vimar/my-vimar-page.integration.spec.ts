import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VIMAR_CLOUD_API_SERVICE } from 'src/app/core/services/vimar-cloud-api.service.interface';
import { MyVimarPageComponent } from 'src/app/features/my-vimar-integration/pages/my-vimar/my-vimar-page.component';

describe('MyVimarIntegration feature integration', () => {
    let fixture: ComponentFixture<MyVimarPageComponent>;
    let component: MyVimarPageComponent;

    const serviceStub = {
        getLinkedAccount: vi.fn(() => of({ email: '', isLinked: false })),
        initiateOAuth: vi.fn(),
        unlinkAccount: vi.fn(() => of(void 0)),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        await TestBed.configureTestingModule({
            imports: [MyVimarPageComponent],
            providers: [{ provide: VIMAR_CLOUD_API_SERVICE, useValue: serviceStub }],
        }).compileComponents();

        fixture = TestBed.createComponent(MyVimarPageComponent);
        component = fixture.componentInstance;
    });

    it('RF11-OBL carica stato account in init', () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
        expect(serviceStub.getLinkedAccount).toHaveBeenCalledTimes(1);
    });

    it('RF12-OBL unlink account esegue refresh stato', () => {
        fixture.detectChanges();

        component.onUnlinkAccount();

        expect(serviceStub.unlinkAccount).toHaveBeenCalledTimes(1);
        expect(serviceStub.getLinkedAccount).toHaveBeenCalledTimes(2);
    });

    it('RF13-OBL fallback errore quando unlink fallisce', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        serviceStub.unlinkAccount.mockReturnValueOnce(throwError(() => new Error('boom')));
        fixture.detectChanges();

        component.onUnlinkAccount();

        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(component.error).toContain('Errore durante la rimozione');
        expect(component.isLoading).toBe(false);

        consoleErrorSpy.mockRestore();
    });
});
