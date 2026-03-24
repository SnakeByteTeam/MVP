import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { IVimarCloudApiService, VIMAR_CLOUD_API_SERVICE } from '../../../../core/services/vimar-cloud-api.service.interface';
import { OAuthCallbackComponent } from './oauth-callback.component';

describe('OAuthCallbackComponent', () => {
  let component: OAuthCallbackComponent;
  let fixture: ComponentFixture<OAuthCallbackComponent>;

  const serviceStub: IVimarCloudApiService = {
    getLinkedAccount: vi.fn(() => of({ email: '', isLinked: false })),
    initiateOAuth: vi.fn(),
    handleOAuthCallback: vi.fn(() => of(void 0)),
    unlinkAccount: vi.fn(() => of(void 0)),
  };

  const routerMock = {
    navigate: vi.fn().mockResolvedValue(true),
  };

  const buildComponent = async (queryParams: Record<string, string>) => {
    await TestBed.configureTestingModule({
      imports: [OAuthCallbackComponent],
      providers: [
        { provide: VIMAR_CLOUD_API_SERVICE, useValue: serviceStub },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
        },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OAuthCallbackComponent);
    component = fixture.componentInstance;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create', async () => {
    await buildComponent({ code: 'abc', state: 'def' });
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('mostra errore quando code/state mancano', async () => {
    await buildComponent({});

    fixture.detectChanges();

    expect(component.callbackError).toBe('Parametri OAuth2 mancanti.');
    expect(serviceStub.handleOAuthCallback).not.toHaveBeenCalled();
  });

  it('chiama handleOAuthCallback e naviga verso /my-vimar in caso di successo', async () => {
    await buildComponent({ code: 'abc', state: 'def' });

    fixture.detectChanges();

    expect(serviceStub.handleOAuthCallback).toHaveBeenCalledWith({ code: 'abc', state: 'def' });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/my-vimar']);
    expect(component.callbackError).toBeNull();
  });

  it('mostra errore quando handleOAuthCallback fallisce', async () => {
    (serviceStub.handleOAuthCallback as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      throwError(() => new Error('callback failed'))
    );
    await buildComponent({ code: 'abc', state: 'def' });

    fixture.detectChanges();

    expect(component.callbackError).toContain('Errore durante la conferma');
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(component.isProcessing).toBe(false);
  });
});
