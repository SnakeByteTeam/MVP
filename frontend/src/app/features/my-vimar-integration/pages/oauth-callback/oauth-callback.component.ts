import { Component, DestroyRef, Inject, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { VIMAR_CLOUD_API_SERVICE, type IVimarCloudApiService } from '../../../../core/services/vimar-cloud-api.service.interface';
import { OAuthCallbackParams } from '../../models/oauth-callback-params.model';

@Component({
	selector: 'app-oauth-callback',
	standalone: true,
	templateUrl: './oauth-callback.component.html',
	styleUrl: './oauth-callback.component.css'
})
export class OAuthCallbackComponent implements OnInit {
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly destroyRef = inject(DestroyRef);

	public isProcessing = true;
	public callbackError: string | null = null;

	constructor(@Inject(VIMAR_CLOUD_API_SERVICE) private readonly service: IVimarCloudApiService) {}

	public ngOnInit(): void {
		const code = this.route.snapshot.queryParamMap.get('code');
		const state = this.route.snapshot.queryParamMap.get('state');

		if (!code || !state) {
			this.callbackError = 'Parametri OAuth2 mancanti.';
			this.isProcessing = false;
			return;
		}

		const params: OAuthCallbackParams = { code, state };
		this.service
			.handleOAuthCallback(params)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.isProcessing = false;
					void this.router.navigate(['/my-vimar']);
				},
				error: (err) => {
					console.error('Errore durante la gestione della callback OAuth2:', err);
					this.callbackError = 'Errore durante la conferma del collegamento MyVimar.';
					this.isProcessing = false;
				}
			});
	}
}
