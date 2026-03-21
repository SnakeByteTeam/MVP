import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { defaultIfEmpty } from 'rxjs';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { AlarmRule } from '../../../../core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from '../../../../core/alarm/models/threshold-operator.enum';
import { AlarmConfigFormValue } from '../../models/alarm-config-form-value.model';
import { AlarmConfigStateService } from '../../services/alarm-config-state.service';

@Component({
	selector: 'app-alarm-config-form',
	templateUrl: './alarm-config-form.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ReactiveFormsModule],
})
export class AlarmConfigFormComponent implements OnInit {
	public form!:
		ReturnType<AlarmConfigFormComponent['buildForm']>;
	public isEditMode = false;
	public readonly priorityOptions = Object.values(AlarmPriority).filter(
		(value): value is AlarmPriority => typeof value === 'number'
	);
	public readonly thresholdOperatorOptions = Object.values(ThresholdOperator);

	private readonly fb = inject(FormBuilder);
	private readonly stateService = inject(AlarmConfigStateService);
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);

	public ngOnInit(): void {
		const id = this.route.snapshot.paramMap.get('id');
		this.isEditMode = !!id;
		this.form = this.buildForm();

		if (!id) {
			return;
		}

		this.stateService.getAlarmById(id).pipe(defaultIfEmpty(null)).subscribe({
			next: (rule) => {
				if (!rule) {
					void this.router.navigate(['../'], { relativeTo: this.route });
					return;
				}

				this.form.patchValue(this.toFormValue(rule));
			},
			error: () => {
				void this.router.navigate(['../'], { relativeTo: this.route });
			},
		});
	}

	public onSubmit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		const formValue = this.form.getRawValue();

		if (this.isEditMode) {
			const id = this.route.snapshot.paramMap.get('id');
			if (!id) {
				return;
			}

			this.stateService.updateAlarm(id, formValue).subscribe(() => {
				void this.router.navigate(['../'], { relativeTo: this.route });
			});
			return;
		}

		this.stateService.createAlarm(formValue).subscribe(() => {
			void this.router.navigate(['../'], { relativeTo: this.route });
		});
	}

	public onCancel(): void {
		void this.router.navigate(['../'], { relativeTo: this.route });
	}

	private buildForm() {
		return this.fb.nonNullable.group({
			name: [''],
			apartmentId: [''],
			sensorId: ['', [Validators.required]],
			priority: [null as AlarmPriority | null, [Validators.required]],
			thresholdOperator: [null as ThresholdOperator | null, [Validators.required]],
			threshold: [null as number | null, [Validators.required]],
			activationTime: [''],
			deactivationTime: [''],
			enabled: [true],
		});
	}

	private toFormValue(rule: AlarmRule): AlarmConfigFormValue {
		return {
			name: rule.name,
			apartmentId: rule.apartmentId,
			sensorId: rule.deviceId,
			priority: rule.priority,
			thresholdOperator: rule.thresholdOperator,
			threshold: rule.threshold,
			activationTime: rule.activationTime,
			deactivationTime: rule.deactivationTime,
			enabled: rule.enabled,
		};
	}
}
