import { Component, input } from '@angular/core';
import { Device } from '../../../apartment-monitor/models/device.model';
import { IDeviceCard } from '../../interfaces/device-card.interface';
import { DeviceType } from '../../models/device-type.enum';

@Component({
	selector: 'app-device-card',
	standalone: true,
	templateUrl: './device-card.component.html',
	styleUrl: './device-card.component.css'
})
export class DeviceCardComponent implements IDeviceCard {
	public readonly roomId = input.required<string>();
	public readonly device = input.required<Device>();

	public getTypeLabel(type: DeviceType): string {
		const labels: Record<DeviceType, string> = {
			[DeviceType.THERMOSTAT]: 'Termostato',
			[DeviceType.FALL_SENSOR]: 'Sensore caduta',
			[DeviceType.PRESENCE_SENSOR]: 'Sensore presenza',
			[DeviceType.LIGHT]: 'Luce',
			[DeviceType.ALARM_BUTTON]: 'Pulsante allarme',
			[DeviceType.ENTRANCE_DOOR]: 'Porta ingresso',
			[DeviceType.BLIND]: 'Tapparella',
		};

		return labels[type] ?? 'Dispositivo';
	}
}
