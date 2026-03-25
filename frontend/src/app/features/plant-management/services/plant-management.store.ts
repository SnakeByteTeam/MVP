import { Injectable, OnDestroy, inject } from '@angular/core';
import { EMPTY, Subject, catchError, map, takeUntil, tap } from 'rxjs';
import { ApartmentApiService } from '../../apartment-monitor/services/apartment-api.service';
import type { AssignPlantDto, AssignOperatorDto, CreateWardDto, UpdateWardDto } from '../models/plant-api.dto';
import { AssignmentOperationsService } from './assignment-operations.service';
import { WardOperationsService } from './ward-operations.service';
import { WardStore } from './ward.store';

@Injectable()
export class PlantManagementStore implements OnDestroy {
    private readonly wardStore = inject(WardStore);
    private readonly wardOperations = inject(WardOperationsService);
    private readonly wardAssignmentOperations = inject(AssignmentOperationsService);
    private readonly apartmentApi = inject(ApartmentApiService);
    private readonly destroy$ = new Subject<void>();

    public readonly wards$ = this.wardStore.wards$;
    public readonly isLoading$ = this.wardStore.isLoading$;
    public readonly error$ = this.wardStore.error$;

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public loadWards(): void {
        this.wardStore.setLoading(true);
        this.wardOperations
            .loadWards()
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }

    public createWard(dto: CreateWardDto): void {
        this.wardStore.setLoading(true);
        this.wardOperations
            .createWard(dto)
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }

    public updateWard(wardId: number, dto: UpdateWardDto): void {
        this.wardStore.setLoading(true);
        this.wardOperations
            .updateWard(wardId, dto)
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }

    public deleteWard(wardId: number): void {
        this.wardStore.setLoading(true);
        this.wardOperations
            .deleteWard(wardId)
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }

    public assignOperator(wardId: number, dto: AssignOperatorDto): void {
        this.wardStore.setLoading(true);
        this.wardAssignmentOperations
            .assignOperator(wardId, dto)
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }

    public removeOperator(wardId: number, userId: number): void {
        this.wardStore.setLoading(true);
        this.wardAssignmentOperations
            .removeOperator(wardId, userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }

    public assignPlant(wardId: number, dto: AssignPlantDto): void {
        this.wardStore.setLoading(true);
        this.wardAssignmentOperations
            .assignPlant(wardId, dto)
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }

    public removePlant(wardId: number, plantId: number): void {
        this.wardStore.setLoading(true);
        this.wardAssignmentOperations
            .removePlant(wardId, plantId)
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }

    public enablePlant(plantId: number): void {
        this.wardStore.setLoading(true);
        this.apartmentApi
            .enableApartment(String(plantId))
            .pipe(
                tap(() => this.wardStore.patchPlant(plantId, { isEnabled: true })),
                tap(() => this.wardStore.setLoading(false)),
                map(() => void 0),
                catchError((error) => {
                    this.wardStore.setError(this.getErrorMessage(error));
                    return EMPTY;
                }),
                takeUntil(this.destroy$),
            )
            .subscribe();
    }

    public disablePlant(plantId: number): void {
        this.wardStore.setLoading(true);
        this.apartmentApi
            .disableApartment(String(plantId))
            .pipe(
                tap(() => this.wardStore.patchPlant(plantId, { isEnabled: false })),
                tap(() => this.wardStore.setLoading(false)),
                map(() => void 0),
                catchError((error) => {
                    this.wardStore.setError(this.getErrorMessage(error));
                    return EMPTY;
                }),
                takeUntil(this.destroy$),
            )
            .subscribe();
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof Error && error.message) {
            return error.message;
        }

        return 'Operazione plant non riuscita.';
    }
}
