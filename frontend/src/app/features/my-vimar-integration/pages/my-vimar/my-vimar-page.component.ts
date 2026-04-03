import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, Inject, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { VIMAR_CLOUD_API_SERVICE, type IVimarCloudApiService } from '../../../../core/services/vimar-cloud-api.service.interface';
import { MyVimarAccountStatusComponent } from '../../components/my-vimar-account-status/my-vimar-account-status.component';
import { MyVimarAccount } from '../../models/my-vimar-account.model';

@Component({
	selector: 'app-my-vimar-page',
	standalone: true,
	imports: [AsyncPipe, MyVimarAccountStatusComponent],
	templateUrl: './my-vimar-page.component.html',
	styleUrl: './my-vimar-page.component.css'
})
export class MyVimarPageComponent implements OnInit {
	private readonly destroyRef = inject(DestroyRef);
	private readonly refresh$ = new Subject<void>();

	public account$!: Observable<MyVimarAccount>;
	public isLoading = false;
	public error = '';

	constructor(@Inject(VIMAR_CLOUD_API_SERVICE) private readonly service: IVimarCloudApiService) {}

	public ngOnInit(): void {
		this.account$ = this.refresh$.pipe(
			startWith(void 0),
			switchMap(() =>
				this.service.getLinkedAccount().pipe(
					catchError((err) => {
						console.error('Errore durante il recupero dello stato account MyVimar:', err);
						this.error = 'Impossibile recuperare lo stato MyVimar. Riprova tra qualche istante.';
						return of({ email: '', isLinked: false });
					})
				)
			)
		);
	}

	public onLinkAccount(): void {
		this.error = '';
		this.service.initiateOAuth();
	}

	public onUnlinkAccount(): void {
		this.error = '';
		this.isLoading = true;

		this.service
			.unlinkAccount()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.isLoading = false;
					this.refresh$.next();
				},
				error: (err) => {
					console.error('Errore durante la rimozione account MyVimar:', err);
					this.error = 'Errore durante la rimozione dell\'account MyVimar.';
					this.isLoading = false;
				}
			});
	}
}
