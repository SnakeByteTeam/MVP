import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from 'src/app/core/tokens/api-base-url.token';
import { UserApiService } from 'src/app/features/user-management/services/user-api.service';
import { DecoderPasswordService } from 'src/app/features/user-management/services/decoder-password-service';

describe('UserApiService', () => {
    let service: UserApiService;
    let decoderPasswordService: DecoderPasswordService;
    let httpController: HttpTestingController;

    const baseUrl = 'http://localhost:3000';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                UserApiService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: API_BASE_URL, useValue: baseUrl },
            ],
        });

        service = TestBed.inject(UserApiService);
        decoderPasswordService = TestBed.inject(DecoderPasswordService);
        httpController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpController?.verify();
        TestBed.resetTestingModule();
    });

    it('deleteUser chiama DELETE /users/:id con id numerico', () => {
        service.deleteUser(42).subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(`${baseUrl}/users/42`);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });

    it('createUser decodifica tempPassword base64 prima di esporla al chiamante', () => {
        const dto = {
            name: 'Mario',
            surname: 'Rossi',
            username: 'mrossi',
        };

        service.createUser(dto).subscribe((result) => {
            expect(result.tempPassword).toBe('TempPass123');
        });

        const request = httpController.expectOne(`${baseUrl}/users`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(dto);
        request.flush({ tempPassword: 'VGVtcFBhc3MxMjM=' });
    });

    it('createUser mantiene tempPassword invariata se non e base64 valida', () => {
        const dto = {
            name: 'Mario',
            surname: 'Rossi',
            username: 'mrossi',
        };

        service.createUser(dto).subscribe((result) => {
            expect(result.tempPassword).toBe('TempPass123');
        });

        const request = httpController.expectOne(`${baseUrl}/users`);
        request.flush({ tempPassword: 'TempPass123' });
    });

    it('decodeTempPassword decodifica base64 valida e mantiene valori non validi', () => {
        expect(decoderPasswordService.decodeTempPassword('VGVzdA==')).toBe('Test');
        expect(decoderPasswordService.decodeTempPassword('')).toBe('');
        expect(decoderPasswordService.decodeTempPassword('abc')).toBe('abc');
        expect(decoderPasswordService.decodeTempPassword('@@@=')).toBe('@@@=');
    });

    it('decodeTempPassword mantiene il valore originale se atob lancia eccezione', () => {
        const atobSpy = vi.spyOn(globalThis, 'atob').mockImplementation(() => {
            throw new Error('decode-failed');
        });

        expect(decoderPasswordService.decodeTempPassword('VGVzdA==')).toBe('VGVzdA==');

        atobSpy.mockRestore();
    });

    it('decodeTempPassword supporta input con spazi ai margini', () => {
        expect(decoderPasswordService.decodeTempPassword('  VGVzdA==  ')).toBe('Test');

        const atobSpy = vi.spyOn(globalThis, 'atob').mockImplementation(() => {
            throw new Error('decode-failed');
        });

        expect(decoderPasswordService.decodeTempPassword('  VGVzdA==  ')).toBe('  VGVzdA==  ');

        atobSpy.mockRestore();
    });
});
