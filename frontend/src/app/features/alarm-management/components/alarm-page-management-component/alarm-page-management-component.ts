import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AlarmListVm } from '../../models/alarm-list-vm.model';
import { AlarmManagementService } from '../../services/alarm-management.service';
import { AlarmItemComponent } from '../alarm-item-component/alarm-item-component';

@Component({
  selector: 'app-alarm-page-management-component',
  imports: [AsyncPipe, AlarmItemComponent],
  templateUrl: './alarm-page-management-component.html',
  styleUrl: './alarm-page-management-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AlarmPageManagementComponent implements OnInit {
  private readonly alarmManagementService = inject(AlarmManagementService);

  public vm$!: Observable<AlarmListVm>;

  public ngOnInit(): void {
    this.vm$ = this.alarmManagementService.vm$;
  }

  public onResolve(activeAlarmId: string): void {
    this.alarmManagementService.resolveAlarm(activeAlarmId);
  }
}
