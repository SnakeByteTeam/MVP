import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AlarmRule } from '../../../../core/alarm/models/alarm-rule.model';
import { AlarmTableShellComponent } from '../../../../shared/components/alarm-table/alarm-table-shell.component';
import { AlarmPriorityIndicatorComponent } from '../../../../shared/components/alarm-table/alarm-priority-indicator.component';
import { AlarmActionButtonComponent } from '../../../../shared/components/alarm-table/alarm-action-button.component';
import { AlarmToggleSwitchComponent } from '../../../../shared/components/alarm-table/alarm-toggle-switch.component';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell.component';
import { AlarmTableColumn } from '../../../../shared/models/alarm-table.model';
import { AlarmConfigFormComponent } from '../alarm-config-form/alarm-config-form.component';
import { AlarmConfigFormValue } from '../../models/alarm-config-form-value.model';
import { AlarmConfigStateService } from '../../services/alarm-config-state.service';
import { AlarmConfigTablePresenterService } from '../../services/alarm-config-table-presenter.service';

@Component({
	selector: 'app-alarm-config-page',
	templateUrl: './alarm-config-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		AlarmTableShellComponent,
		AlarmPriorityIndicatorComponent,
		AlarmActionButtonComponent,
		AlarmToggleSwitchComponent,
		ModalShellComponent,
		AlarmConfigFormComponent,
	],
})
export class AlarmConfigPageComponent implements OnInit {
	private readonly stateService = inject(AlarmConfigStateService);
	private readonly tablePresenter = inject(AlarmConfigTablePresenterService);

	public readonly columns: readonly AlarmTableColumn[] = [
		{ id: 'name', label: 'Nome' },
		{ id: 'apartment', label: 'Appartamento' },
		{ id: 'device', label: 'Dispositivo' },
		{ id: 'priority', label: 'Priorita' },
		{ id: 'threshold', label: 'Soglia' },
		{ id: 'armingTime', label: 'Orario attivazione' },
		{ id: 'dearmingTime', label: 'Orario disattivazione' },
		{ id: 'actions', label: 'Azioni' },
	];

	public readonly alarms = toSignal(this.stateService.alarms$, { initialValue: [] as AlarmRule[] });
	public readonly error = toSignal(this.stateService.error$, { initialValue: null as string | null });
	public readonly isModalOpen = signal(false);
	public readonly editingRule = signal<AlarmRule | null>(null);

	public readonly rows = computed(() => this.tablePresenter.toRows(this.alarms()));

	public ngOnInit(): void {
		this.stateService.loadAlarmRules();
	}

	public onCreateNew(): void {
		this.editingRule.set(null);
		this.isModalOpen.set(true);
	}

	public onEdit(alarmRuleId: string): void {
		const ruleToEdit = this.alarms().find((rule) => rule.id === alarmRuleId) ?? null;
		if (!ruleToEdit) {
			return;
		}

		this.editingRule.set(ruleToEdit);
		this.isModalOpen.set(true);
	}

	public onToggleEnabled(alarmRuleId: string, enabled: boolean): void {
		this.stateService.toggleEnabled(alarmRuleId, enabled).subscribe();
	}

	public onDelete(id: string): void {
		this.stateService.deleteAlarmRule(id).subscribe();
	}

	public onFormSubmitted(formValue: AlarmConfigFormValue): void {
		const editingRule = this.editingRule();

		if (editingRule) {
			this.stateService.updateAlarmRule(editingRule.id, formValue).subscribe(() => {
				this.onModalClosed();
			});
			return;
		}

		this.stateService.createAlarmRule(formValue).subscribe(() => {
			this.onModalClosed();
		});
	}

	public onModalClosed(): void {
		this.isModalOpen.set(false);
		this.editingRule.set(null);
	}
}
