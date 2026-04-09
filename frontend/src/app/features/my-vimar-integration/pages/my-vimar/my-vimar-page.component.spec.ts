import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { IVimarCloudApiService, VIMAR_CLOUD_API_SERVICE } from '../../../../core/services/vimar-cloud-api.service.interface';
import { MyVimarPageComponent } from './my-vimar-page.component';

describe('MyVimarPageComponent', () => {
  let component: MyVimarPageComponent;
  let fixture: ComponentFixture<MyVimarPageComponent>;

  const serviceStub: IVimarCloudApiService = {
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

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('carica lo stato account in ngOnInit', () => {
    fixture.detectChanges();

    expect(serviceStub.getLinkedAccount).toHaveBeenCalledTimes(1);
  });

  it('delegates onLinkAccount al service', () => {
    component.onLinkAccount();

    expect(serviceStub.initiateOAuth).toHaveBeenCalledTimes(1);
  });

  it('onUnlinkAccount richiama il service e triggera refresh', () => {
    fixture.detectChanges();

    component.onUnlinkAccount();

    expect(serviceStub.unlinkAccount).toHaveBeenCalledTimes(1);
    expect(serviceStub.getLinkedAccount).toHaveBeenCalledTimes(2);
  });

  it('imposta errore quando unlinkAccount fallisce', () => {
    (serviceStub.unlinkAccount as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      throwError(() => new Error('boom'))
    );

    fixture.detectChanges();
    component.onUnlinkAccount();

    expect(component.error).toContain('Errore durante la rimozione');
    expect(component.isLoading).toBe(false);
  });
});
