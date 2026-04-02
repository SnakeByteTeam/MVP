import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AlarmListVm } from '../../models/alarm-list-vm.model';
import { AlarmManagementService } from '../../services/alarm-management.service';
import { AlarmItemComponent } from '../alarm-item-component/alarm-item-component';

@Component({
  selector: 'app-alarm-page-management-component',
  imports: [AlarmItemComponent],
  templateUrl: './alarm-page-management-component.html',
  styleUrl: './alarm-page-management-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmPageManagementComponent implements OnInit {
  private readonly alarmManagementService = inject(AlarmManagementService);

  public readonly vm = toSignal<AlarmListVm | null>(this.alarmManagementService.vm$, {
    initialValue: null,
  });

  public ngOnInit(): void {
    this.alarmManagementService.initialize();
  }

  public onResolve(activeAlarmId: string): void {
    this.alarmManagementService.resolveAlarm(activeAlarmId);
  }
}
