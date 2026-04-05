import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlarmManagementRefreshService {
    private readonly refreshRequested$ = new Subject<void>();

    public requestRefresh(): void {
        this.refreshRequested$.next();
    }

    public getRefreshRequested$(): Observable<void> {
        return this.refreshRequested$.asObservable();
    }
}
