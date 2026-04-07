import { Component, input, output } from '@angular/core';
import { IDeviceCard } from '../../interfaces/device-card.interface';
import { Device } from '../../../apartment-monitor/models/device.model';
import { ExecuteActionDto } from '../../models/execute-action.model';
import { DeviceType } from '../../models/device-type.enum';
import { getDeviceTypeLabel } from '../../../../shared/models/device-taxonomy';

@Component({
	selector: 'app-thermostat-card',
	standalone: true,
	templateUrl: './thermostat-card.component.html',
	styleUrl: './thermostat-card.component.css'
})
export class ThermostatCardComponent implements IDeviceCard {
	public readonly roomId = input.required<string>();
	public readonly device = input.required<Device>();
	public readonly isExecuting = input(false);
	public readonly error = input<string | null>(null);
	public readonly actionRequested = output<ExecuteActionDto>();

	public getTypeLabel(type: DeviceType): string {
		return getDeviceTypeLabel(type);
	}

	public onAction(action: string): void {
		this.actionRequested.emit({ roomId: this.roomId(), deviceId: this.device().id, action });
	}
}
