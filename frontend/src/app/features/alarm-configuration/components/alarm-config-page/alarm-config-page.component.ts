import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlarmRule } from '../../../../core/alarm/models/alarm-rule.model';
import { AlarmConfigStateService } from '../../services/alarm-config-state.service';

@Component({
	selector: 'app-alarm-config-page',
	templateUrl: './alarm-config-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [AsyncPipe],
	standalone: true
})
export class AlarmConfigPageComponent implements OnInit {
	public alarms$!: Observable<AlarmRule[]>;
	public error$!: Observable<string | null>;

	private readonly stateService = inject(AlarmConfigStateService);
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);

	public ngOnInit(): void {
		this.alarms$ = this.stateService.alarms$;
		this.error$ = this.stateService.error$;
		this.stateService.loadAlarmRules();
	}

	public onCreateNew(): void {
		void this.router.navigate(['./new'], { relativeTo: this.route });
	}

	public onEdit(rule: AlarmRule): void {
		void this.router.navigate(['./', rule.id, 'edit'], { relativeTo: this.route });
	}

	public onToggleEnabled(rule: AlarmRule): void {
		this.stateService.toggleEnabled(rule.id, !rule.isArmed).subscribe();
	}

	public onDelete(id: string): void {
		this.stateService.deleteAlarmRule(id).subscribe();
	}
}
