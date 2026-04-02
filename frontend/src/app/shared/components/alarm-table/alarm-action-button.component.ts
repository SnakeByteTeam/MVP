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
            'inline-flex min-w-[74px] items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide transition focus-visible:outline-2 focus-visible:outline-offset-2';

        if (this.tone() === 'primary') {
            return `${baseClass} border-yellow-600 bg-yellow-400 text-slate-900 hover:bg-yellow-300 focus-visible:outline-yellow-500 disabled:border-slate-400 disabled:bg-slate-300 disabled:text-slate-600`;
        }

        if (this.tone() === 'danger') {
            return `${baseClass} border-rose-700 bg-rose-500 text-white hover:bg-rose-400 focus-visible:outline-rose-500 disabled:border-slate-400 disabled:bg-slate-300 disabled:text-slate-600`;
        }

        return `${baseClass} border-slate-500 bg-white text-slate-900 hover:bg-slate-100 focus-visible:outline-slate-500 disabled:border-slate-400 disabled:bg-slate-200 disabled:text-slate-600`;
    });

    public onPressed(): void {
        if (this.disabled()) {
            return;
        }

        this.pressed.emit();
    }
}
