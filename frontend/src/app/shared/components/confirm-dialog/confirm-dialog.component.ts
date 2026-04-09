import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
    selector: 'app-confirm-dialog',
    imports: [],
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
    public readonly message = input('Confermi questa operazione?');
    public readonly confirmLabel = input('Conferma');
    public readonly cancelLabel = input('Annulla');

    public readonly confirmed = output<void>();
    public readonly cancelled = output<void>();

    public onConfirm(): void {
        this.confirmed.emit();
    }

    public onCancel(): void {
        this.cancelled.emit();
    }
}
