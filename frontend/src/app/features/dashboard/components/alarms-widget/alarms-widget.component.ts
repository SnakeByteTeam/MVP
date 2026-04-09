import { ChangeDetectionStrategy, Component, DestroyRef, computed, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AlarmListVm } from '../../../alarm-management/models/alarm-list-vm.model';
import { AlarmManagementService } from '../../../alarm-management/services/alarm-management.service';
import { AlarmManagementTablePresenterService } from '../../../alarm-management/services/alarm-management-table-presenter.service';
import { AlarmManagementRefreshService } from '../../../../core/alarm/services/alarm-management-refresh.service';
import { AlarmTableShellComponent } from '../../../../shared/components/alarm-table/alarm-table-shell.component';
import { AlarmPriorityIndicatorComponent } from '../../../../shared/components/alarm-table/alarm-priority-indicator.component';
import { AlarmActionButtonComponent } from '../../../../shared/components/alarm-table/alarm-action-button.component';
import { ElapsedTimePipe } from '../../../../shared/pipes/elapsed-time.pipe';
import { AlarmTableColumn } from '../../../../shared/models/alarm-table.model';

@Component({
  selector: 'app-alarms-widget',
  imports: [AlarmTableShellComponent, AlarmPriorityIndicatorComponent, AlarmActionButtonComponent, ElapsedTimePipe],
  templateUrl: './alarms-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmWidgetComponent implements OnInit {
  private readonly alarmManagementService = inject(AlarmManagementService);
  private readonly tablePresenter = inject(AlarmManagementTablePresenterService);
  private readonly alarmManagementRefreshService = inject(AlarmManagementRefreshService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly columns: readonly AlarmTableColumn[] = [
    { id: 'priority', label: 'Priorità' },
    { id: 'name', label: 'Nome' },
    { id: 'location', label: 'Luogo' },
    { id: 'status', label: 'Stato' },
    { id: 'openedAt', label: 'Scattato' },
    { id: 'actions', label: 'Azioni' },
  ];

  public readonly vm = toSignal<AlarmListVm | null>(this.alarmManagementService.vm$, {
    initialValue: null,
  });

  public readonly rows = computed(() => {
    const vmState = this.vm();
    if (!vmState) {
      return [];
    }

    return this.tablePresenter.toRows(vmState.alarms, vmState.resolvingId);
  });

  public readonly canGoPrevious = computed(() => this.vm()?.canGoPrevious ?? false);
  public readonly canGoNext = computed(() => this.vm()?.canGoNext ?? false);
  public readonly currentPage = computed(() => this.vm()?.currentPage ?? 1);

  public ngOnInit(): void {
    this.alarmManagementService.initialize();

    this.alarmManagementRefreshService
      .getRefreshRequested$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.alarmManagementService.initialize();
      });
  }

  public onResolve(activeAlarmId: string): void {
    this.alarmManagementService.resolveAlarm(activeAlarmId);
  }
}
