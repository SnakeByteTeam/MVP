import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ActiveAlarm } from '../../../../core/alarm/models/active-alarm.model';
import { ElapsedTimePipe } from '../../../../shared/pipes/elapsed-time.pipe';
import { AlarmItemViewModel } from './models/alarm-item-view.model';
import { AlarmItemPresenterService } from './services/alarm-item-presenter.service';

@Component({
  selector: 'app-alarm-item-component',
  imports: [ElapsedTimePipe],
  templateUrl: './alarm-item-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmItemComponent {
  private readonly presenter = inject(AlarmItemPresenterService);

  public readonly alarm = input.required<ActiveAlarm>();
  public readonly isResolving = input<boolean>(false);
  public readonly resolve = output<string>();

  public readonly vm = computed<AlarmItemViewModel>(() =>
    this.presenter.toViewModel(this.alarm(), this.isResolving())
  );

  public onResolveClick(): void {
    this.resolve.emit(this.vm().id);
  }
}
