import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { UserRole } from '../../../core/models/user-role.enum';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import type { CreateWardDto } from '../models/plant-api.dto';
import type { Ward } from '../models/ward.model';
import { PlantApiService } from './plant-api.service';

describe('PlantApiService', () => {
    let service: PlantApiService;
    let httpController: HttpTestingController;

    const baseUrl = 'http://api.example.test';
    const wardsEndpoint = `${baseUrl}/api/wards`;

    const ward: Ward = {
        id: 'ward-1',
        name: 'Cardiologia',
        apartments: [{ id: 'apt-1', name: 'App. 101', isEnabled: true }],
        operators: [
            {
                id: 'user-1',
                firstName: 'Mario',
                lastName: 'Rossi',
                username: 'mrossi',
                role: UserRole.OPERATORE_SANITARIO,
            },
        ],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PlantApiService,
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                    provide: API_BASE_URL,
                    useValue: baseUrl,
                },
            ],
        });

        service = TestBed.inject(PlantApiService);
        httpController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpController.verify();
    });

    it('chiama GET /api/wards in getWards', () => {
        service.getWards().subscribe((result) => {
            expect(result).toEqual([ward]);
            expect(result).toHaveLength(1);
        });

        const request = httpController.expectOne(wardsEndpoint);
        expect(request.request.method).toBe('GET');
        request.flush([ward]);
    });

    it('chiama POST /api/wards in createWard', () => {
        const dto: CreateWardDto = { name: 'Neurologia' };

        service.createWard(dto).subscribe((result) => {
            expect(result).toEqual(ward);
            expect(result.id).toBe('ward-1');
        });

        const request = httpController.expectOne(wardsEndpoint);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(dto);
        request.flush(ward);
    });

    it('chiama PUT /api/wards/:id codificando l id', () => {
        service.updateWard('ward/one', { name: 'Cardio 2' }).subscribe((result) => {
            expect(result).toEqual(ward);
        });

        const request = httpController.expectOne(`${wardsEndpoint}/ward%2Fone`);
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ name: 'Cardio 2' });
        request.flush(ward);
    });

    it('chiama DELETE /api/wards/:id/operators/:userId codificando i segmenti', () => {
        service.removeOperatorFromWard('ward one', 'user/42').subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(
            `${wardsEndpoint}/ward%20one/operators/user%2F42`
        );
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });

    it('chiama POST /api/wards/:id/apartments in assignApartmentToWard', () => {
        service.assignApartmentToWard('ward-1', { apartmentId: 'apt-2' }).subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(`${wardsEndpoint}/ward-1/apartments`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ apartmentId: 'apt-2' });
        request.flush(null);
    });

    it('chiama DELETE /api/wards/:id in deleteWard', () => {
        service.deleteWard('ward:one').subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(`${wardsEndpoint}/ward%3Aone`);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });

    it('chiama POST /api/wards/:id/operators in assignOperatorToWard', () => {
        service.assignOperatorToWard('ward-1', { userId: 'user-9' }).subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(`${wardsEndpoint}/ward-1/operators`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ userId: 'user-9' });
        request.flush(null);
    });

    it('chiama DELETE /api/wards/:id/apartments/:apartmentId in removeApartmentFromWard', () => {
        service.removeApartmentFromWard('ward 1', 'apt/2').subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(
            `${wardsEndpoint}/ward%201/apartments/apt%2F2`
        );
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });
});
