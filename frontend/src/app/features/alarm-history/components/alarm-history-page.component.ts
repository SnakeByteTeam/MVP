import { Component, computed, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AlarmListVm } from '../models/alarm-list-vm.model';
import { AlarmTableColumn } from '../../../shared/models/alarm-table.model';
import { AlarmHistoryService } from '../services/alarm-history.service';
import { AlarmTableRow } from '../models/alarm-table-row';
import { ActiveAlarm } from '../../../core/alarm/models/active-alarm.model';
import { AlarmPriorityIndicatorComponent } from '../../../shared/components/alarm-table/alarm-priority-indicator.component';
import { AlarmTableShellComponent } from '../../../shared/components/alarm-table/alarm-table-shell.component';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'alarm-history',
    standalone: true,
    imports: [
        AlarmPriorityIndicatorComponent,
        AlarmTableShellComponent,
        DatePipe,
    ],
    templateUrl: './alarm-history-page.component.html',
    styleUrl: './alarm-history-page.component.css'
})
export class AlarmHistoryPageComponent implements OnInit {
    private readonly alarmHistoryService = inject(AlarmHistoryService);

    public readonly columns: readonly AlarmTableColumn[] = [
        { id: 'priority', label: 'Priorità' },
        { id: 'name', label: 'Nome' },
        { id: 'location', label: 'Luogo' },
        { id: 'status', label: 'Stato' },
        { id: 'openedAt', label: 'Scattato il' },
        { id: 'closedAt', label: 'Risolto il' },
        { id: 'handlerUsername', label: 'Gestito da' },
    ];

    ngOnInit(): void {
        this.alarmHistoryService.initialize();
    }

    public readonly vm = toSignal<AlarmListVm | null>(this.alarmHistoryService.vm$, {
        initialValue: null,
    });

    public readonly rows = computed((): AlarmTableRow[] => {
        const vmState = this.vm();
        if (!vmState) return [];
        return vmState.alarms
            .map((alarm: ActiveAlarm) => this.toRow(alarm))
            .sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime());
    });

    public readonly canGoPrevious = computed(() => this.vm()?.canGoPrevious ?? false);
    public readonly canGoNext = computed(() => this.vm()?.canGoNext ?? false);
    public readonly currentPage = computed(() => this.vm()?.currentPage ?? 1);

    public onNextPage(): void {
        this.alarmHistoryService.nextPage();
    }

    public onPreviousPage(): void {
        this.alarmHistoryService.previousPage();
    }

    private toRow(alarm: ActiveAlarm): AlarmTableRow {
        console.log('alarm:', alarm);
        return {
            id: alarm.id,
            priority: alarm.priority,
            name: alarm.alarmName,
            device: alarm.deviceId ?? 'sconosciuto',
            location: alarm.position,
            status: alarm.resolutionTime === null ? 'Da gestire' : 'Gestito',
            openedAt: alarm.activationTime,
            closedAt: alarm.resolutionTime ?? 'sconosciuto',
            handlerUsername: alarm.userUsername ?? 'sconosciuto',
        };
    }
}
