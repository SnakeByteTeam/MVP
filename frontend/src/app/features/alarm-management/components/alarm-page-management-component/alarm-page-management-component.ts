import { ChangeDetectionStrategy, Component, DestroyRef, computed, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AlarmListVm } from '../../models/alarm-list-vm.model';
import { AlarmManagementService } from '../../services/alarm-management.service';
import { AlarmManagementTablePresenterService } from '../../services/alarm-management-table-presenter.service';
import { AlarmManagementRefreshService } from '../../../../core/alarm/services/alarm-management-refresh.service';
import { AlarmTableShellComponent } from '../../../../shared/components/alarm-table/alarm-table-shell.component';
import { AlarmPriorityIndicatorComponent } from '../../../../shared/components/alarm-table/alarm-priority-indicator.component';
import { AlarmActionButtonComponent } from '../../../../shared/components/alarm-table/alarm-action-button.component';
import { AlarmTableColumn } from '../../../../shared/models/alarm-table.model';

@Component({
  selector: 'app-alarm-page-management-component',
  imports: [AlarmTableShellComponent, AlarmPriorityIndicatorComponent, AlarmActionButtonComponent],
  templateUrl: './alarm-page-management-component.html',
  styleUrl: './alarm-page-management-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmPageManagementComponent implements OnInit {
  private readonly alarmManagementService = inject(AlarmManagementService);
  private readonly tablePresenter = inject(AlarmManagementTablePresenterService);
  private readonly alarmManagementRefreshService = inject(AlarmManagementRefreshService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly columns: readonly AlarmTableColumn[] = [
    { id: 'priority', label: 'Priorita' },
    { id: 'name', label: 'Nome' },
    { id: 'device', label: 'Dispositivo' },
    { id: 'location', label: 'Luogo' },
    { id: 'status', label: 'Stato' },
    { id: 'openedAt', label: 'Orario apertura' },
    { id: 'closedAt', label: 'Orario chiusura' },
    { id: 'manager', label: 'Gestore' },
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

  public onNextPage(): void {
    this.alarmManagementService.nextPage();
  }

  public onPreviousPage(): void {
    this.alarmManagementService.previousPage();
  }
}
