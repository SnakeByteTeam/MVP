import { Component, input, output } from '@angular/core';
import { MyVimarAccount } from '../../models/my-vimar-account.model';

@Component({
	selector: 'app-my-vimar-account-status',
	standalone: true,
	templateUrl: './my-vimar-account-status.component.html',
	styleUrl: './my-vimar-account-status.component.css'
})
export class MyVimarAccountStatusComponent {
	public readonly account = input.required<MyVimarAccount>();
	public readonly isLoading = input(false);
	public readonly error = input('');

	public readonly linkClicked = output<void>();
	public readonly unlinkClicked = output<void>();

	public onLinkAccount(): void {
		this.linkClicked.emit();
	}

	public onUnlinkAccount(): void {
		this.unlinkClicked.emit();
	}
}
