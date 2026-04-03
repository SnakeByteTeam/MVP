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
        const baseClass =
            'inline-flex min-h-8 min-w-[92px] items-center justify-center rounded-md border px-3 py-1.5 text-xs font-semibold tracking-wide transition focus-visible:outline-2 focus-visible:outline-offset-2';

        if (this.tone() === 'primary') {
            return `${baseClass} border-amber-300 bg-amber-300 text-slate-900 hover:bg-amber-200 focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-400`;
        }

        if (this.tone() === 'danger') {
            return `${baseClass} border-red-600 bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-400`;
        }

        return `${baseClass} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400`;
    });

    public onPressed(): void {
        if (this.disabled()) {
            return;
        }

        this.pressed.emit();
    }
}
