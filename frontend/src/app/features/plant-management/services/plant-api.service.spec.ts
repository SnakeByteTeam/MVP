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
    const wardUsersRelationshipsEndpoint = `${baseUrl}/api/wards-users-relationships`;
    const wardPlantsRelationshipsEndpoint = `${baseUrl}/api/wards-plants-relationships`;

    const ward: Ward = {
        id: 1,
        name: 'Cardiologia',
        apartments: [{ id: 101, name: 'App. 101', isEnabled: true }],
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
            expect(result.id).toBe(1);
        });

        const request = httpController.expectOne(wardsEndpoint);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(dto);
        request.flush(ward);
    });

    it('chiama PUT /api/wards/:id in updateWard', () => {
        service.updateWard(12, { name: 'Cardio 2' }).subscribe((result) => {
            expect(result).toEqual(ward);
        });

        const request = httpController.expectOne(`${wardsEndpoint}/12`);
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ name: 'Cardio 2' });
        request.flush(ward);
    });

    it('chiama DELETE /api/wards-users-relationships/:wardId/:userId', () => {
        service.removeOperatorFromWard(10, 42).subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(`${wardUsersRelationshipsEndpoint}/10/42`);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });

    it('chiama POST /api/wards-plants-relationships con wardId e plantId', () => {
        service.assignPlantToWard(1, { plantId: 102 }).subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(wardPlantsRelationshipsEndpoint);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ wardId: 1, plantId: 102 });
        request.flush(null);
    });

    it('chiama DELETE /api/wards/:id in deleteWard', () => {
        service.deleteWard(33).subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(`${wardsEndpoint}/33`);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });

    it('chiama POST /api/wards-users-relationships con wardId e userId', () => {
        service.assignOperatorToWard(1, { userId: 9 }).subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(wardUsersRelationshipsEndpoint);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ wardId: 1, userId: 9 });
        request.flush(null);
    });

    it('chiama DELETE /api/wards-plants-relationships/:wardId/:plantId', () => {
        service.removePlantFromWard(1, 102).subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(`${wardPlantsRelationshipsEndpoint}/1/102`);
        expect(request.request.method).toBe('DELETE');
        request.flush(null);
    });

    it('mantiene compatibilita con assignPlantToWard mappando plantId -> plantId', () => {
        service.assignPlantToWard(1, { plantId: 103 }).subscribe((result) => {
            expect(result).toBeNull();
        });

        const request = httpController.expectOne(wardPlantsRelationshipsEndpoint);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ wardId: 1, plantId: 103 });
        request.flush(null);
    });
});
