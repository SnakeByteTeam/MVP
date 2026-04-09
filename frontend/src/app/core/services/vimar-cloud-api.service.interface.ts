import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MyVimarAccount } from '../../features/my-vimar-integration/models/my-vimar-account.model';

export interface IVimarCloudApiService {
	getLinkedAccount(): Observable<MyVimarAccount>;
	initiateOAuth(): void;
	unlinkAccount(): Observable<void>;
}

export const VIMAR_CLOUD_API_SERVICE = new InjectionToken<IVimarCloudApiService>('VimarCloudApiService');
