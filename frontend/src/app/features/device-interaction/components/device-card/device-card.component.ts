import { Component, input, output } from '@angular/core';
import { Datapoint } from '../../../apartment-monitor/models/datapoint.model';
import { Device } from '../../../apartment-monitor/models/device.model';
import { IDeviceCard } from '../../interfaces/device-card.interface';
import { DeviceType } from '../../models/device-type.enum';
import { WriteDatapointRequest } from '../../models/write-datapoint-request.model';
import { getDeviceTypeLabel, getEndpointLabel } from '../../../../shared/models/device-taxonomy';

@Component({
	selector: 'app-device-card',
	standalone: true,
	templateUrl: './device-card.component.html',
	styleUrl: './device-card.component.css'
})
export class DeviceCardComponent implements IDeviceCard {
	public readonly roomId = input.required<string>();
	public readonly device = input.required<Device>();
	public readonly isExecuting = input(false);
	public readonly error = input<string | null>(null);
	public readonly datapointWriteRequested = output<WriteDatapointRequest>();

	private readonly selectedValues = new Map<string, string>();

	public getTypeLabel(type: DeviceType): string {
		return getDeviceTypeLabel(type);
	}

	public getDatapointLabel(datapoint: Datapoint): string {
		return getEndpointLabel(datapoint.sfeType);
	}

	public getWritableEnumDatapoints(): Datapoint[] {
		return this.device().datapoints.filter(
			(datapoint) => datapoint.writable && datapoint.enum.length > 0,
		);
	}

	public hasWritableDatapoints(): boolean {
		return this.getWritableEnumDatapoints().length > 0;
	}

	public getSelectedValue(datapointId: string, values: string[]): string {
		const currentValue = this.selectedValues.get(datapointId);

		if (currentValue) {
			return currentValue;
		}

		const fallbackValue = values[0] ?? '';
		this.selectedValues.set(datapointId, fallbackValue);
		return fallbackValue;
	}

	public onSelectionChange(datapointId: string, value: string): void {
		this.selectedValues.set(datapointId, value);
	}

	public onWriteDatapoint(datapointId: string, values: string[]): void {
		if (this.isExecuting()) {
			return;
		}

		const selectedValue = this.getSelectedValue(datapointId, values);
		if (!selectedValue) {
			return;
		}

		this.datapointWriteRequested.emit({
			roomId: this.roomId(),
			deviceId: this.device().id,
			datapointId,
			value: selectedValue,
		});
	}
}
