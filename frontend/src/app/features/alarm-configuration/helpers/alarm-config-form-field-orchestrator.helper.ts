import { Injectable } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { Datapoint } from '../../apartment-monitor/models/datapoint.model';
import { DeviceDatapointExtractionService, DeviceDatapointOption } from '../services/device-datapoint-extraction.service';

type AlarmConfigFormLike = {
    controls: {
        name: AbstractControl;
        plantId: AbstractControl;
        deviceId: AbstractControl;
        datapointId: AbstractControl;
        thresholdOperator: AbstractControl;
    };
};

export type DeviceSelectionResult = {
    normalizedDeviceId: string;
    readableDatapoints: Datapoint[];
    autoSelectedDatapointId: string | null;
};

export type DatapointSelectionResult = {
    normalizedDatapointId: string;
    selectedDatapoint: Datapoint | null;
};

@Injectable({ providedIn: 'root' })
export class AlarmConfigFormFieldOrchestratorHelper {
    constructor(private readonly datapointExtraction: DeviceDatapointExtractionService) { }

    public applyModeState(form: AlarmConfigFormLike, mode: 'create' | 'edit'): void {
        const isEditMode = mode === 'edit';

        if (isEditMode) {
            form.controls.name.disable({ emitEvent: false });
            form.controls.plantId.clearValidators();
            form.controls.plantId.disable({ emitEvent: false });
            form.controls.deviceId.disable({ emitEvent: false });
            form.controls.datapointId.clearValidators();
            form.controls.datapointId.disable({ emitEvent: false });
            form.controls.thresholdOperator.disable({ emitEvent: false });
            form.controls.plantId.updateValueAndValidity({ emitEvent: false });
            form.controls.datapointId.updateValueAndValidity({ emitEvent: false });
            form.controls.thresholdOperator.updateValueAndValidity({ emitEvent: false });
            return;
        }

        form.controls.name.enable({ emitEvent: false });
        form.controls.plantId.setValidators([Validators.required]);
        form.controls.datapointId.setValidators([Validators.required]);
        form.controls.plantId.enable({ emitEvent: false });
        form.controls.thresholdOperator.enable({ emitEvent: false });
        form.controls.plantId.updateValueAndValidity({ emitEvent: false });
        form.controls.datapointId.updateValueAndValidity({ emitEvent: false });
        form.controls.thresholdOperator.updateValueAndValidity({ emitEvent: false });

        if (String(form.controls.plantId.value ?? '').trim().length === 0) {
            form.controls.deviceId.disable({ emitEvent: false });
            form.controls.datapointId.disable({ emitEvent: false });
            return;
        }

        form.controls.deviceId.enable({ emitEvent: false });

        if (String(form.controls.deviceId.value ?? '').trim().length === 0) {
            form.controls.datapointId.disable({ emitEvent: false });
            return;
        }

        form.controls.datapointId.enable({ emitEvent: false });
    }

    public resetDatapointControl(form: AlarmConfigFormLike): void {
        form.controls.datapointId.setValue('', { emitEvent: false });
        form.controls.datapointId.updateValueAndValidity({ emitEvent: false });
    }

    public resolveDeviceSelection(
        deviceId: string,
        deviceOptions: readonly DeviceDatapointOption[],
    ): DeviceSelectionResult {
        const normalizedDeviceId = deviceId.trim();
        if (normalizedDeviceId.length === 0) {
            return {
                normalizedDeviceId,
                readableDatapoints: [],
                autoSelectedDatapointId: null,
            };
        }

        const readableDatapoints = this.datapointExtraction.findReadableDatapoints(
            normalizedDeviceId,
            deviceOptions,
        );

        return {
            normalizedDeviceId,
            readableDatapoints,
            autoSelectedDatapointId: readableDatapoints.length === 1 ? readableDatapoints[0].id : null,
        };
    }

    public resolveDatapointSelection(
        datapointId: string,
        datapointOptions: readonly Datapoint[],
    ): DatapointSelectionResult {
        const normalizedDatapointId = datapointId.trim();

        return {
            normalizedDatapointId,
            selectedDatapoint: this.datapointExtraction.findDatapointById(normalizedDatapointId, datapointOptions),
        };
    }
}
