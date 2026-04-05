import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
    selector: 'app-alarm-toggle-switch',
    templateUrl: './alarm-toggle-switch.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmToggleSwitchComponent {
    public readonly checked = input<boolean>(false);
    public readonly disabled = input<boolean>(false);
    public readonly ariaLabel = input<string>('Abilita o disabilita');

    public readonly toggled = output<boolean>();

    public readonly trackClass = computed(() => {
        const baseClass =
            'relative inline-flex h-5 w-9 items-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-2';

        if (this.checked()) {
            return `${baseClass} border-yellow-700 bg-yellow-400 focus-visible:outline-yellow-500 disabled:border-slate-400 disabled:bg-slate-300`;
        }

        return `${baseClass} border-slate-500 bg-white focus-visible:outline-slate-500 disabled:border-slate-400 disabled:bg-slate-200`;
    });

    public readonly thumbClass = computed(() => {
        const baseClass =
            'inline-block h-4 w-4 transform rounded-full border border-slate-500 bg-white transition';

        if (this.checked()) {
            return `${baseClass} translate-x-4`;
        }

        return `${baseClass} translate-x-0.5`;
    });

    public onToggle(): void {
        if (this.disabled()) {
            return;
        }

        this.toggled.emit(!this.checked());
    }
}
