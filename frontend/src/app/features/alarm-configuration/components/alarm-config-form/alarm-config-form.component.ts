import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { AlarmRule } from '../../../../core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from '../../../../core/alarm/models/threshold-operator.enum';
import { AlarmRuleFormMapper } from '../../mappers/alarm-rule-form.mapper';
import { AlarmConfigFormValue } from '../../models/alarm-config-form-value.model';
import { AlarmPriorityIndicatorComponent } from '../../../../shared/components/alarm-table/alarm-priority-indicator.component';
import { AlarmToggleSwitchComponent } from '../../../../shared/components/alarm-table/alarm-toggle-switch.component';
import { AlarmActionButtonComponent } from '../../../../shared/components/alarm-table/alarm-action-button.component';

@Component({
	selector: 'app-alarm-config-form',
	templateUrl: './alarm-config-form.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ReactiveFormsModule, AlarmPriorityIndicatorComponent, AlarmToggleSwitchComponent, AlarmActionButtonComponent],
})
export class AlarmConfigFormComponent {
	public readonly mode = input<'create' | 'edit'>('create');
	public readonly initialRule = input<AlarmRule | null>(null);

	public readonly submittedForm = output<AlarmConfigFormValue>();
	public readonly cancelled = output<void>();

	private readonly fb = inject(FormBuilder);
	private readonly formMapper = inject(AlarmRuleFormMapper);

	public readonly form = this.buildForm();
	public readonly isEditMode = computed(() => this.mode() === 'edit');

	public readonly priorityOptions = Object.values(AlarmPriority).filter(
		(value): value is AlarmPriority => typeof value === 'number'
	);
	public readonly thresholdOperatorOptions = Object.values(ThresholdOperator);

	constructor() {
		effect(() => {
			const rule = this.initialRule();
			if (rule) {
				this.form.reset(this.formMapper.toFormValue(rule));
				return;
			}

			this.form.reset(this.createEmptyFormValue());
		});
	}

	private buildForm() {
		return this.fb.nonNullable.group({
			name: [''],
			sensorId: ['', [Validators.required]],
			priority: [null as AlarmPriority | null, [Validators.required]],
			thresholdOperator: [null as ThresholdOperator | null, [Validators.required]],
			threshold: [null as number | null, [Validators.required]],
			armingTime: [''],
			dearmingTime: [''],
			enabled: [true],
		});
	}

	private createEmptyFormValue(): AlarmConfigFormValue {
		return {
			name: '',
			sensorId: '',
			priority: null,
			thresholdOperator: null,
			threshold: null,
			armingTime: '',
			dearmingTime: '',
			enabled: true,
		};
	}

	public onSubmit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		this.submittedForm.emit(this.form.getRawValue());
	}

	public onCancel(): void {
		this.cancelled.emit();
	}

	public onEnabledToggled(nextValue: boolean): void {
		this.form.controls.enabled.setValue(nextValue);
	}
}
