import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { UserApiService } from './user-api.service';

describe('UserApiService', () => {
    let service: UserApiService;
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
});
