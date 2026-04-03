import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApartmentApiService } from '../../../apartment-monitor/services/apartment-api.service';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { AlarmRule } from '../../../../core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from '../../../../core/alarm/models/threshold-operator.enum';
import { WardPlantDto } from '../../../ward-management/models/ward-api.dto';
import { WardApiService } from '../../../ward-management/services/ward-api.service';
import { AlarmRuleFormMapper } from '../../mappers/alarm-rule-form.mapper';
import { AlarmConfigFormValue } from '../../models/alarm-config-form-value.model';
import { AlarmPriorityIndicatorComponent } from '../../../../shared/components/alarm-table/alarm-priority-indicator.component';
import { AlarmToggleSwitchComponent } from '../../../../shared/components/alarm-table/alarm-toggle-switch.component';
import { AlarmActionButtonComponent } from '../../../../shared/components/alarm-table/alarm-action-button.component';

type DeviceOption = {
	id: string;
	label: string;
};

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
	private readonly wardApi = inject(WardApiService);
	private readonly apartmentApi = inject(ApartmentApiService);
	private readonly destroyRef = inject(DestroyRef);
	private hasRequestedPlants = false;

	public readonly form = this.buildForm();
	public readonly isEditMode = computed(() => this.mode() === 'edit');
	public readonly plants = signal<WardPlantDto[]>([]);
	public readonly deviceOptions = signal<DeviceOption[]>([]);
	public readonly plantsLoadError = signal<string | null>(null);
	public readonly devicesLoadError = signal<string | null>(null);
	public readonly isDevicesLoading = signal(false);
	public readonly isDeviceSelectionLocked = computed(() => this.isEditMode() || this.form.controls.sensorId.disabled);
	public readonly isPlantSelectionVisible = computed(() => !this.isEditMode());

	public readonly priorityOptions = Object.values(AlarmPriority).filter(
		(value): value is AlarmPriority => typeof value === 'number'
	);
	public readonly thresholdOperatorOptions = Object.values(ThresholdOperator);

	constructor() {
		effect(() => {
			const rule = this.initialRule();
			if (rule) {
				this.form.reset(this.formMapper.toFormValue(rule));
				this.deviceOptions.set([{ id: rule.deviceId, label: rule.deviceId }]);
				this.applyModeState();
				return;
			}

			this.form.reset(this.createEmptyFormValue());
			this.deviceOptions.set([]);
			this.applyModeState();
			this.ensurePlantsLoaded();
		});

		this.form.controls.plantId.valueChanges
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((plantId) => {
				if (this.mode() === 'edit') {
					return;
				}

				this.onPlantChanged(plantId);
			});
	}

	private buildForm() {
		return this.fb.nonNullable.group({
			name: [''],
			plantId: [''],
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
			plantId: '',
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

		const formValue = this.form.getRawValue();
		const lockedRule = this.initialRule();
		if (this.mode() === 'edit' && lockedRule) {
			this.submittedForm.emit({ ...formValue, name: lockedRule.name });
			return;
		}

		this.submittedForm.emit(formValue);
	}

	private applyModeState(): void {
		const isEditMode = this.mode() === 'edit';

		if (isEditMode) {
			this.form.controls.name.disable({ emitEvent: false });
			this.form.controls.plantId.clearValidators();
			this.form.controls.plantId.disable({ emitEvent: false });
			this.form.controls.sensorId.disable({ emitEvent: false });
			this.form.controls.plantId.updateValueAndValidity({ emitEvent: false });
			return;
		}

		this.form.controls.name.enable({ emitEvent: false });
		this.form.controls.plantId.setValidators([Validators.required]);
		this.form.controls.plantId.enable({ emitEvent: false });
		this.form.controls.plantId.updateValueAndValidity({ emitEvent: false });

		if (this.form.controls.plantId.value.trim().length === 0) {
			this.form.controls.sensorId.disable({ emitEvent: false });
			return;
		}

		this.form.controls.sensorId.enable({ emitEvent: false });
	}

	private ensurePlantsLoaded(): void {
		if (this.mode() === 'edit' || this.plants().length > 0 || this.hasRequestedPlants) {
			return;
		}

		this.hasRequestedPlants = true;

		this.wardApi
			.getAvailablePlants()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (plants) => {
					this.plantsLoadError.set(null);
					this.plants.set(plants);
				},
				error: () => {
					this.plants.set([]);
					this.plantsLoadError.set('Errore durante il caricamento degli impianti disponibili.');
				},
			});
	}

	private onPlantChanged(plantId: string): void {
		this.devicesLoadError.set(null);
		this.deviceOptions.set([]);
		this.form.controls.sensorId.setValue('', { emitEvent: false });

		if (plantId.trim().length === 0) {
			this.form.controls.sensorId.disable({ emitEvent: false });
			return;
		}

		this.isDevicesLoading.set(true);
		this.form.controls.sensorId.disable({ emitEvent: false });

		this.apartmentApi
			.getApartmentByPlantId(plantId)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (apartment) => {
					const options = apartment.rooms.flatMap((room) =>
						room.devices.map((device) => ({ id: device.id, label: `${room.name} - ${device.name}` }))
					);

					this.deviceOptions.set(options);
					this.form.controls.sensorId.enable({ emitEvent: false });
					this.isDevicesLoading.set(false);
				},
				error: () => {
					this.deviceOptions.set([]);
					this.devicesLoadError.set('Errore durante il caricamento dei dispositivi.');
					this.form.controls.sensorId.disable({ emitEvent: false });
					this.isDevicesLoading.set(false);
				},
			});
	}

	public onCancel(): void {
		this.cancelled.emit();
	}

	public onEnabledToggled(nextValue: boolean): void {
		this.form.controls.enabled.setValue(nextValue);
	}
}
