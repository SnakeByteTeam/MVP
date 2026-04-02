import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { defaultIfEmpty } from 'rxjs';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { ThresholdOperator } from '../../../../core/alarm/models/threshold-operator.enum';
import { AlarmRuleFormMapper } from '../../mappers/alarm-rule-form.mapper';
import { AlarmConfigStateService } from '../../services/alarm-config-state.service';

@Component({
	selector: 'app-alarm-config-form',
	templateUrl: './alarm-config-form.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ReactiveFormsModule],
	standalone: true
})
export class AlarmConfigFormComponent implements OnInit {

	//form, costruisco con funzione helper
	public form!:
		ReturnType<AlarmConfigFormComponent['buildForm']>;
	public isEditMode = false;
	//per le enum
	public readonly priorityOptions = Object.values(AlarmPriority).filter(
		(value): value is AlarmPriority => typeof value === 'number'
	);
	public readonly thresholdOperatorOptions = Object.values(ThresholdOperator);

	private readonly fb = inject(FormBuilder);
	private readonly stateService = inject(AlarmConfigStateService);
	private readonly formMapper = inject(AlarmRuleFormMapper);
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);


	//helper
	private buildForm() {
		return this.fb.nonNullable.group({
			name: [''],
			sensorId: ['', [Validators.required]],
			priority: [null as AlarmPriority | null, [Validators.required]],
			thresholdOperator: [null as ThresholdOperator | null, [Validators.required]],
			threshold: [null as number | null, [Validators.required]],
			activationTime: [''],
			deactivationTime: [''],
			enabled: [true],
		});
	}

	public ngOnInit(): void {
		const id = this.route.snapshot.paramMap.get('id');
		this.isEditMode = !!id;
		this.form = this.buildForm();

		if (!id) {
			return;
		}

		this.stateService.getAlarmRuleById(id).pipe(defaultIfEmpty(null)).subscribe({
			next: (rule) => {
				if (!rule) {
					void this.router.navigate(['../'], { relativeTo: this.route });
					return;
				}

				this.form.patchValue(this.formMapper.toFormValue(rule));
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

			this.stateService.updateAlarmRule(id, formValue).subscribe(() => {
				void this.router.navigate(['../'], { relativeTo: this.route });
			});
			return;
		}

		this.stateService.createAlarmRule(formValue).subscribe(() => {
			void this.router.navigate(['../'], { relativeTo: this.route });
		});
	}

	public onCancel(): void {
		void this.router.navigate(['../'], { relativeTo: this.route });
	}

}
