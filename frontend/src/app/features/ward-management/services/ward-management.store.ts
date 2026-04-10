import { Injectable, OnDestroy, inject } from '@angular/core';
import { Observable, Subject, catchError, of, takeUntil } from 'rxjs';
import type { User } from '../../user-management/models/user.model';
import type { AssignPlantDto, AssignOperatorDto, CreateWardDto, UpdateWardDto } from '../models/ward-api.dto';
import type { Plant } from '../models/plant.model';
import { AssignmentOperationsService } from './assignment-operations.service';
import { WardOperationsService } from './ward-operations.service';
import { WardStore } from './ward.store';

@Injectable()
export class WardManagementStore implements OnDestroy {
    private readonly wardStore = inject(WardStore);
    private readonly wardOperations = inject(WardOperationsService);
    private readonly wardAssignmentOperations = inject(AssignmentOperationsService);
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

    public removePlant(plantId: string): void {
        this.wardStore.setLoading(true);
        this.wardAssignmentOperations
            .removePlant(plantId)
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }

    public getAvailablePlantsForWard(wardId: number): Observable<Plant[] | null> {
        return this.wardAssignmentOperations.getAvailablePlantsForWard(wardId).pipe(
            catchError((error) => {
                this.wardStore.setError(this.getErrorMessage(error));
                return of(null);
            }),
        );
    }

    public getAvailableUsersForWard(wardId: number): Observable<User[] | null> {
        return this.wardAssignmentOperations.getAvailableUsersForWard(wardId).pipe(
            catchError((error) => {
                this.wardStore.setError(this.getErrorMessage(error));
                return of(null);
            }),
        );
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof Error && error.message) {
            return error.message;
        }

        return 'Operazione plant non riuscita.';
    }
}
