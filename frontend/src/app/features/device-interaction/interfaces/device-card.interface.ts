import { InputSignal } from '@angular/core';
import { Device } from '../../apartment-monitor/models/device.model';

export interface IDeviceCard {
	readonly roomId: InputSignal<string>;
	readonly device: InputSignal<Device>;
}
