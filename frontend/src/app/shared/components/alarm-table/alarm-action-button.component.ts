import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type AlarmActionButtonTone = 'neutral' | 'danger' | 'primary';

@Component({
    selector: 'app-alarm-action-button',
    templateUrl: './alarm-action-button.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmActionButtonComponent {
    public readonly label = input.required<string>();
    public readonly ariaLabel = input<string | null>(null);
    public readonly tone = input<AlarmActionButtonTone>('neutral');
    public readonly disabled = input<boolean>(false);

    public readonly pressed = output<void>();

    public readonly buttonClass = computed(() => {
        const baseClass = 'care-btn care-btn--compact min-w-[96px] focus-visible:outline-2 focus-visible:outline-offset-2';

        if (this.tone() === 'primary') {
            return `${baseClass} care-btn--primary focus-visible:outline-amber-400`;
        }

        if (this.tone() === 'danger') {
            return `${baseClass} care-btn--danger focus-visible:outline-red-500`;
        }

        return `${baseClass} care-btn--neutral focus-visible:outline-slate-400`;
    });

    public onPressed(): void {
        if (this.disabled()) {
            return;
        }

        this.pressed.emit();
    }
}
