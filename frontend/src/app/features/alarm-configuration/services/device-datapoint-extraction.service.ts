import { Injectable } from '@angular/core';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import { Apartment } from '../../apartment-monitor/models/apartment.model';
import { Datapoint } from '../../apartment-monitor/models/datapoint.model';

export type DeviceDatapointOption = {
    id: string;
    label: string;
    datapoints: Datapoint[];
};

@Injectable({ providedIn: 'root' })
export class DeviceDatapointExtractionService {
    private readonly numericThresholdPattern = /^[+-]?\d+([.]\d+)?$/;

    public extractDeviceOptions(apartment: Apartment): DeviceDatapointOption[] {
        return apartment.rooms.flatMap((room) =>
            room.devices.map((device) => ({
                id: device.id,
                label: `${room.name} - ${device.name}`,
                datapoints: this.normalizeDatapoints(device.datapoints),
            }))
        );
    }

    public findReadableDatapoints(
        deviceId: string,
        deviceOptions: readonly DeviceDatapointOption[],
    ): Datapoint[] {
        const selectedDevice = deviceOptions.find((option) => option.id === deviceId);
        if (!selectedDevice) {
            return [];
        }

        return selectedDevice.datapoints.filter((datapoint) => datapoint.readable);
    }

    public findDatapointById(datapointId: string, datapoints: readonly Datapoint[]): Datapoint | null {
        return datapoints.find((datapoint) => datapoint.id === datapointId) ?? null;
    }

    public getAllowedOperators(datapoint: Datapoint | null): ThresholdOperator[] {
        if (!this.usesEnumeratedThreshold(datapoint)) {
            return Object.values(ThresholdOperator);
        }

        return [ThresholdOperator.EQUAL_TO];
    }

    public getEnumValues(datapoint: Datapoint | null): string[] {
        if (!datapoint) {
            return [];
        }

        return this.normalizeEnumValues(datapoint.enum);
    }

    //dice se il datapoint richiede una threshold enumerata come on/off o numerica 
    public usesEnumeratedThreshold(datapoint: Datapoint | null): boolean {
        return this.getEnumValues(datapoint).length > 0;
    }

    public normalizeThresholdValue(datapoint: Datapoint | null, value: string): string {
        const trimmedValue = value.trim();
        const enumValues = this.getEnumValues(datapoint);

        if (enumValues.length === 0) {
            return trimmedValue;
        }

        const matchingEnumValue = enumValues.find(
            (enumValue) => enumValue.toLowerCase() === trimmedValue.toLowerCase(),
        );

        return matchingEnumValue ?? trimmedValue;
    }

    public isThresholdValueValid(datapoint: Datapoint | null, value: string): boolean {
        const trimmedValue = value.trim();
        if (trimmedValue.length === 0) {
            return false;
        }

        const enumValues = this.getEnumValues(datapoint);
        if (enumValues.length > 0) {
            return enumValues.some(
                (enumValue) => enumValue.toLowerCase() === trimmedValue.toLowerCase(),
            );
        }

        return this.numericThresholdPattern.test(trimmedValue);
    }

    private normalizeDatapoints(datapoints: readonly Datapoint[] | undefined): Datapoint[] {
        return (datapoints ?? []).map((datapoint) => ({
            ...datapoint,
            enum: this.normalizeEnumValues(datapoint.enum),
        }));
    }

    private normalizeEnumValues(values: readonly string[] | undefined): string[] {
        const normalizedValues = (values ?? [])
            .map((value) => value.trim())
            .filter((value) => value.length > 0);

        return Array.from(new Set(normalizedValues));
    }
}

