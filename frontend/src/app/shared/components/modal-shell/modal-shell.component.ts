import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
    selector: 'app-modal-shell',
    templateUrl: './modal-shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalShellComponent {
    public readonly open = input<boolean>(false);
    public readonly title = input.required<string>();
    public readonly description = input<string | null>(null);
    public readonly closeLabel = input<string>('Chiudi finestra');

    public readonly closed = output<void>();

    public onClose(): void {
        this.closed.emit();
    }
}
