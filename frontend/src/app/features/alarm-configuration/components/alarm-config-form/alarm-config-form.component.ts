import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Datapoint } from '../../../apartment-monitor/models/datapoint.model';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { AlarmRule } from '../../../../core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from '../../../../core/alarm/models/threshold-operator.enum';
import { AlarmRuleFormMapper } from '../../mappers/alarm-rule-form.mapper';
import { AlarmConfigFormValue } from '../../models/alarm-config-form-value.model';
import { AlarmPriorityIndicatorComponent } from '../../../../shared/components/alarm-table/alarm-priority-indicator.component';
import { AlarmActionButtonComponent } from '../../../../shared/components/alarm-table/alarm-action-button.component';
import { DeviceDatapointExtractionService, DeviceDatapointOption } from '../../services/device-datapoint-extraction.service';
import { AlarmConfigFormValidationHelper } from '../../helpers/alarm-config-form-validation.helper';
import { AlarmConfigFormStateService } from '../../services/alarm-config-form-state.service';
import { AlarmConfigFormFieldOrchestratorHelper } from '../../helpers/alarm-config-form-field-orchestrator.helper';

@Component({
	selector: 'app-alarm-config-form',
	templateUrl: './alarm-config-form.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [AlarmConfigFormStateService],
	imports: [ReactiveFormsModule, AlarmPriorityIndicatorComponent, AlarmActionButtonComponent],
})
export class AlarmConfigFormComponent {
	public readonly mode = input<'create' | 'edit'>('create');
	public readonly initialRule = input<AlarmRule | null>(null);

	public readonly submittedForm = output<AlarmConfigFormValue>();
	public readonly cancelled = output<void>();

	private readonly fb = inject(FormBuilder);
	private readonly formMapper = inject(AlarmRuleFormMapper);
	private readonly formState = inject(AlarmConfigFormStateService);
	private readonly datapointExtraction = inject(DeviceDatapointExtractionService);
	private readonly validationHelper = inject(AlarmConfigFormValidationHelper);
	private readonly fieldOrchestrator = inject(AlarmConfigFormFieldOrchestratorHelper);
	private readonly destroyRef = inject(DestroyRef);
	private editDatapointLookupVersion = 0;

	public readonly form = this.buildForm();
	public readonly isEditMode = computed(() => this.mode() === 'edit');
	public readonly plants = this.formState.plants;
	public readonly deviceOptions = signal<DeviceDatapointOption[]>([]);
	public readonly datapointOptions = signal<Datapoint[]>([]);
	public readonly plantsLoadError = this.formState.plantsLoadError;
	public readonly devicesLoadError = this.formState.devicesLoadError;
	public readonly isDevicesLoading = this.formState.isDevicesLoading;
	public readonly selectedDeviceId = signal('');
	public readonly selectedDatapointId = signal('');
	public readonly selectedDatapoint = signal<Datapoint | null>(null);
	public readonly isPlantSelectionVisible = computed(() => !this.isEditMode());
	public readonly editPosition = computed(() => {
		if (!this.isEditMode()) {
			return '-';
		}

		const position = this.initialRule()?.position ?? '';
		return this.toPositionLabel(position);
	});

	public readonly priorityOptions = Object.values(AlarmPriority).filter(
		(value): value is AlarmPriority => typeof value === 'number'
	);
	public readonly thresholdOperatorOptions = computed(() => {
		if (!this.isEditMode()) {
			return this.datapointExtraction.getAllowedOperators(this.selectedDatapoint());
		}

		const datapoint = this.selectedDatapoint();
		if (datapoint !== null) {
			return this.datapointExtraction.getAllowedOperators(datapoint);
		}

		const currentOperator = this.form.controls.thresholdOperator.value;
		return currentOperator === null ? Object.values(ThresholdOperator) : [currentOperator];
	});
	public readonly thresholdValueEnumHints = computed(() =>
		this.datapointExtraction.getEnumValues(this.selectedDatapoint())
	);
	public readonly thresholdValueHelpText = computed(() => {
		if (this.isEditMode()) {
			if (this.thresholdValueEnumHints().length > 0) {
				return 'Inserisci uno dei valori previsti dal datapoint associato alla regola.';
			}

			return 'Inserisci un valore numerico (es. 10, 10.5, -3).';
		}

		if (this.selectedDeviceId().length === 0) {
			return 'Seleziona prima il dispositivo.';
		}

		if (this.selectedDatapointId().length === 0) {
			return 'Seleziona un datapoint leggibile per impostare la soglia.';
		}

		if (this.thresholdValueEnumHints().length > 0) {
			return 'Inserisci uno dei valori previsti dal datapoint selezionato.';
		}

		return 'Inserisci un valore numerico (es. 10, 10.5, -3).';
	});

	constructor() {
		effect(() => {
			const rule = this.initialRule();
			if (rule) {
				const lookupVersion = ++this.editDatapointLookupVersion;
				this.form.reset(this.formMapper.toFormValue(rule));
				this.deviceOptions.set([{ id: rule.deviceId, label: rule.deviceId, datapoints: [] }]);
				this.datapointOptions.set([]);
				this.selectedDeviceId.set(rule.deviceId);
				this.selectedDatapointId.set(rule.datapointId ?? '');
				this.selectedDatapoint.set(null);
				this.applyModeState();
				this.applyThresholdConstraints(null);
				this.loadEditDatapointMetadata(rule.deviceId, rule.datapointId ?? '', lookupVersion);
				return;
			}

			this.editDatapointLookupVersion += 1;
			this.form.reset(this.createEmptyFormValue());
			this.deviceOptions.set([]);
			this.datapointOptions.set([]);
			this.selectedDeviceId.set('');
			this.selectedDatapointId.set('');
			this.selectedDatapoint.set(null);
			this.applyModeState();
			this.applyThresholdConstraints(null);
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

		this.form.controls.deviceId.valueChanges
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((deviceId) => {
				if (this.mode() === 'edit') {
					return;
				}

				this.onDeviceChanged(deviceId);
			});

		this.form.controls.datapointId.valueChanges
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((datapointId) => {
				if (this.mode() === 'edit') {
					return;
				}

				this.onDatapointChanged(datapointId);
			});
	}

	private buildForm() {
		return this.fb.nonNullable.group({
			name: [''],
			plantId: [''],
			deviceId: ['', [Validators.required]],
			datapointId: [''],
			priority: [null as AlarmPriority | null, [Validators.required]],
			thresholdOperator: [null as ThresholdOperator | null, [Validators.required]],
			thresholdValue: ['', [Validators.required]],
			armingTime: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
			dearmingTime: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
			enabled: [true],
		});
	}

	//valore iniziale del form in create mode
	private createEmptyFormValue(): AlarmConfigFormValue {
		return {
			name: '',
			plantId: '',
			deviceId: '',
			datapointId: '',
			priority: null,
			thresholdOperator: null,
			thresholdValue: '',
			armingTime: '',
			dearmingTime: '',
			enabled: true,
		};
	}

	public onSubmit(): void {
		if (this.mode() === 'create' && this.selectedDatapoint() !== null) {
			const normalizedThreshold = this.datapointExtraction.normalizeThresholdValue(
				this.selectedDatapoint(),
				this.form.controls.thresholdValue.value,
			);
			this.form.controls.thresholdValue.setValue(normalizedThreshold, { emitEvent: false });
			this.form.controls.thresholdValue.updateValueAndValidity({ emitEvent: false });
		}

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
		this.fieldOrchestrator.applyModeState(this.form, this.mode());
	}

	private ensurePlantsLoaded(): void {
		this.formState.ensurePlantsLoaded(this.mode())
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe();
	}

	//opzioni dispositovo per gl'impianto scelto
	private onPlantChanged(plantId: string): void {
		this.formState.resetDevicesLoadState();
		this.deviceOptions.set([]);
		this.form.controls.deviceId.setValue('', { emitEvent: false });
		this.onDeviceChanged('');

		if (plantId.trim().length === 0) {
			this.form.controls.deviceId.disable({ emitEvent: false });
			return;
		}

		this.form.controls.deviceId.disable({ emitEvent: false });

		this.formState
			.loadDeviceOptionsByPlant(plantId)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((options) => {
				this.deviceOptions.set(options);
				if (options.length === 0) {
					this.form.controls.deviceId.disable({ emitEvent: false });
				} else {
					this.form.controls.deviceId.enable({ emitEvent: false });
				}
			});
	}

	//trasforma device -> tutti datapoint leggibili
	private onDeviceChanged(deviceId: string): void {
		const deviceSelection = this.fieldOrchestrator.resolveDeviceSelection(deviceId, this.deviceOptions());
		this.selectedDeviceId.set(deviceSelection.normalizedDeviceId);
		this.datapointOptions.set([]);
		this.selectedDatapoint.set(null);
		this.selectedDatapointId.set('');
		this.fieldOrchestrator.resetDatapointControl(this.form);
		this.applyThresholdConstraints(null);

		if (deviceSelection.normalizedDeviceId.length === 0) {
			this.form.controls.datapointId.disable({ emitEvent: false });
			return;
		}

		this.datapointOptions.set(deviceSelection.readableDatapoints);
		this.form.controls.datapointId.enable({ emitEvent: false });

		if (deviceSelection.autoSelectedDatapointId !== null) {
			this.form.controls.datapointId.setValue(deviceSelection.autoSelectedDatapointId, { emitEvent: false });
			this.onDatapointChanged(deviceSelection.autoSelectedDatapointId);
		}
	}

	private onDatapointChanged(datapointId: string): void {
		const datapointSelection = this.fieldOrchestrator.resolveDatapointSelection(datapointId, this.datapointOptions());
		this.selectedDatapointId.set(datapointSelection.normalizedDatapointId);
		this.selectedDatapoint.set(datapointSelection.selectedDatapoint);
		this.applyThresholdConstraints(datapointSelection.selectedDatapoint);
	}

	private applyThresholdConstraints(datapoint: Datapoint | null): void {
		this.validationHelper.applyThresholdConstraints({
			mode: this.mode(),
			datapoint,
			thresholdOperatorControl: this.form.controls.thresholdOperator,
			thresholdValueControl: this.form.controls.thresholdValue,
		});
	}

	private loadEditDatapointMetadata(deviceId: string, datapointId: string, lookupVersion: number): void {
		if (this.mode() !== 'edit') {
			return;
		}

		const normalizedDatapointId = datapointId.trim();
		if (normalizedDatapointId.length === 0) {
			if (lookupVersion !== this.editDatapointLookupVersion || this.mode() !== 'edit') {
				return;
			}

			this.selectedDatapoint.set(null);
			this.applyThresholdConstraints(null);
			return;
		}

		this.formState
			.resolveDatapointForEdit(deviceId, normalizedDatapointId)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((resolvedDatapoint) => {
				if (lookupVersion !== this.editDatapointLookupVersion || this.mode() !== 'edit') {
					return;
				}

				this.selectedDatapoint.set(resolvedDatapoint);
				this.applyThresholdConstraints(resolvedDatapoint);
			});
	}

	private toPositionLabel(position: string): string {
		const normalized = position.replaceAll(/\s*-\s*/g, ' - ').trim();
		if (normalized.length === 0) {
			return '-';
		}

		return normalized;
	}

	public onCancel(): void {
		this.cancelled.emit();
	}
}



