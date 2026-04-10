import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlarmManagementPaginationService {
    public readonly pageLimit = 6;

    private readonly pageOffsetSubject = new BehaviorSubject<number>(0);
    private readonly canGoNextSubject = new BehaviorSubject<boolean>(false);

    public readonly pageOffset$ = this.pageOffsetSubject.asObservable();
    public readonly canGoNext$ = this.canGoNextSubject.asObservable();

    public reset(): void {
        this.pageOffsetSubject.next(0);
        this.canGoNextSubject.next(false);
    }

    public getOffset(): number {
        return this.pageOffsetSubject.getValue();
    }

    public canGoNext(): boolean {
        return this.canGoNextSubject.getValue();
    }

    public canGoPrevious(): boolean {
        return this.getOffset() > 0;
    }

    public getNextOffset(): number {
        return this.getOffset() + this.pageLimit;
    }

    public getPreviousOffset(): number {
        return Math.max(0, this.getOffset() - this.pageLimit);
    }

    public update(offset: number, canGoNext: boolean): void {
        this.pageOffsetSubject.next(offset);
        this.canGoNextSubject.next(canGoNext);
    }

    public toPageNumber(offset: number): number {
        return Math.floor(offset / this.pageLimit) + 1;
    }
}
