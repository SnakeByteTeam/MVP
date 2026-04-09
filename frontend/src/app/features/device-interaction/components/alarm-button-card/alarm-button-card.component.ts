import { Component, input, output } from '@angular/core';
import { IDeviceCard } from '../../interfaces/device-card.interface';
import { Device } from '../../../apartment-monitor/models/device.model';
import { ExecuteActionDto } from '../../models/execute-action.model';

@Component({
	selector: 'app-alarm-button-card',
	standalone: true,
	templateUrl: './alarm-button-card.component.html',
	styleUrl: './alarm-button-card.component.css'
})
export class AlarmButtonCardComponent implements IDeviceCard {
	public readonly roomId = input.required<string>();
	public readonly device = input.required<Device>();
	public readonly isExecuting = input(false);
	public readonly error = input<string | null>(null);
	public readonly actionRequested = output<ExecuteActionDto>();

	public onAction(action: string): void {
		this.actionRequested.emit({ roomId: this.roomId(), deviceId: this.device().id, action });
	}
}
