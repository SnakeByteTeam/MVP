import { ChangeDetectionStrategy, Component, DestroyRef, computed, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, timer } from 'rxjs';
import { AlarmListVm } from '../../models/alarm-list-vm.model';
import { AlarmManagementService } from '../../services/alarm-management.service';
import { AlarmManagementTablePresenterService } from '../../services/alarm-management-table-presenter.service';
import { AlarmManagementRefreshService } from '../../../../core/alarm/services/alarm-management-refresh.service';
import { AlarmTableShellComponent } from '../../../../shared/components/alarm-table/alarm-table-shell.component';
import { AlarmPriorityIndicatorComponent } from '../../../../shared/components/alarm-table/alarm-priority-indicator.component';
import { AlarmActionButtonComponent } from '../../../../shared/components/alarm-table/alarm-action-button.component';
import { ElapsedTimePipe } from '../../../../shared/pipes/elapsed-time.pipe';
import { AlarmTableColumn } from '../../../../shared/models/alarm-table.model';
import { InternalAuthService } from '../../../../core/services/internal-auth.service';
import { UserRole } from '../../../../core/models/user-role.enum';

@Component({
  selector: 'app-alarm-page-management-component',
  imports: [AlarmTableShellComponent, AlarmPriorityIndicatorComponent, AlarmActionButtonComponent, ElapsedTimePipe],
  templateUrl: './alarm-page-management-component.html',
  styleUrl: './alarm-page-management-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmPageManagementComponent implements OnInit {
  private readonly alarmManagementService = inject(AlarmManagementService);
  private readonly tablePresenter = inject(AlarmManagementTablePresenterService);
  private readonly alarmManagementRefreshService = inject(AlarmManagementRefreshService);
  private readonly authService = inject(InternalAuthService);
  private readonly destroyRef = inject(DestroyRef);

  //per OSS no gestore
  private readonly baseColumns: readonly AlarmTableColumn[] = [
    { id: 'priority', label: 'Priorita' },
    { id: 'name', label: 'Nome' },
    { id: 'device', label: 'Dispositivo' },
    { id: 'location', label: 'Luogo' },
    { id: 'status', label: 'Stato' },
    { id: 'openedAt', label: 'Scattato da' },
    // { id: 'closedAt', label: 'Orario chiusura' },
    { id: 'actions', label: 'Azioni' },
  ];

  private readonly adminColumns: readonly AlarmTableColumn[] = [
    { id: 'priority', label: 'Priorita' },
    { id: 'name', label: 'Nome' },
    { id: 'device', label: 'Dispositivo' },
    { id: 'location', label: 'Luogo' },
    { id: 'status', label: 'Stato' },
    { id: 'openedAt', label: 'Scattato da' },
    // { id: 'closedAt', label: 'Orario chiusura' },
    // { id: 'manager', label: 'Gestore' },
    { id: 'actions', label: 'Azioni' },
  ];

  public readonly vm = toSignal<AlarmListVm | null>(this.alarmManagementService.vm$, {
    initialValue: null,
  });
  public readonly currentUser = toSignal(this.authService.getCurrentUser$(), { initialValue: null });
  public readonly nowEpochMs = toSignal(timer(0, 60_000).pipe(map(() => Date.now())), {
    initialValue: Date.now(),
  });
  public readonly showManagerColumn = computed(
    () => this.currentUser()?.role === UserRole.AMMINISTRATORE,
  );
  public readonly columns = computed<readonly AlarmTableColumn[]>(() =>
    this.showManagerColumn() ? this.adminColumns : this.baseColumns,
  );

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
