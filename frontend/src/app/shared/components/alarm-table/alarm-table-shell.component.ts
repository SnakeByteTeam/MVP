import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AlarmTableColumn } from '../../models/alarm-table.model';

@Component({
    selector: 'app-alarm-table-shell',
    templateUrl: './alarm-table-shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmTableShellComponent {
    public readonly title = input.required<string>();
    public readonly caption = input<string>('Tabella allarmi');
    public readonly columns = input.required<readonly AlarmTableColumn[]>();
    public readonly showCreateButton = input<boolean>(false);
    public readonly createButtonAriaLabel = input<string>('Aggiungi nuovo elemento');

    public readonly createRequested = output<void>();

    public onCreateRequest(): void {
        this.createRequested.emit();
    }
}
