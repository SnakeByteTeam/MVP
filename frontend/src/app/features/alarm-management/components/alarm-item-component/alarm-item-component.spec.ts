import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import type { ActiveAlarm } from '../../../../core/alarm/models/active-alarm.model';
import { ElapsedTimePipe } from '../../../../shared/pipes/elapsed-time.pipe';
import { AlarmItemComponent } from './alarm-item-component';

@Pipe({ name: 'elapsedTime' })
class MockElapsedTimePipe implements PipeTransform {
  public transform(value: string): string {
    return `mock-elapsed:${value}`;
  }
}

describe('AlarmItemComponent', () => {
  let component: AlarmItemComponent;
  let fixture: ComponentFixture<AlarmItemComponent>;

  const baseAlarm: ActiveAlarm = {
    id: 'active-1',
    alarmRuleId: 'rule-1',
    alarmName: 'Allarme antipanico',
    priority: AlarmPriority.RED,
    triggeredAt: '2026-03-24T10:00:00.000Z',
  };

  const setInputs = (alarm: ActiveAlarm, isResolving = false): void => {
    fixture.componentRef.setInput('alarm', alarm);
    fixture.componentRef.setInput('isResolving', isResolving);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlarmItemComponent],
    })
      .overrideComponent(AlarmItemComponent, {
        remove: { imports: [ElapsedTimePipe] },
        add: { imports: [MockElapsedTimePipe] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AlarmItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    setInputs(baseAlarm);
    expect(component).toBeTruthy();
  });

  it('priorityLabel mappa correttamente tutti i livelli', () => {
    setInputs({ ...baseAlarm, priority: AlarmPriority.RED });
    expect(component.priorityLabel()).toBe('Alta');

    setInputs({ ...baseAlarm, priority: AlarmPriority.ORANGE });
    expect(component.priorityLabel()).toBe('Media');

    setInputs({ ...baseAlarm, priority: AlarmPriority.GREEN });
    expect(component.priorityLabel()).toBe('Bassa');

    setInputs({ ...baseAlarm, priority: AlarmPriority.WHITE });
    expect(component.priorityLabel()).toBe('Informativa');
  });

  it('priorityClass mappa correttamente tutti i livelli', () => {
    setInputs({ ...baseAlarm, priority: AlarmPriority.RED });
    expect(component.priorityClass()).toBe('priority-red');

    setInputs({ ...baseAlarm, priority: AlarmPriority.ORANGE });
    expect(component.priorityClass()).toBe('priority-orange');

    setInputs({ ...baseAlarm, priority: AlarmPriority.GREEN });
    expect(component.priorityClass()).toBe('priority-green');

    setInputs({ ...baseAlarm, priority: AlarmPriority.WHITE });
    expect(component.priorityClass()).toBe('priority-white');
  });

  it('onResolveClick emette alarm.id', () => {
    setInputs(baseAlarm);
    const emitSpy = vi.spyOn(component.resolve, 'emit');

    component.onResolveClick();

    expect(emitSpy).toHaveBeenCalledWith('active-1');
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('renderizza nome allarme, priorita label e tempo trasformato dalla pipe mockata', () => {
    setInputs(baseAlarm);
    const nativeElement = fixture.nativeElement as HTMLElement;
    const metaValues = nativeElement.querySelectorAll('.alarm-item__meta dd');

    expect(nativeElement.querySelector('.alarm-item__title')?.textContent).toContain('Allarme antipanico');
    expect(nativeElement.querySelector('.alarm-item__priority')?.textContent).toContain('Alta');
    expect(metaValues.item(1)?.textContent).toContain('mock-elapsed:2026-03-24T10:00:00.000Z');
  });

  it('quando isResolving e true disabilita il bottone e mostra lo stato di avanzamento', () => {
    setInputs(baseAlarm, true);
    const nativeElement = fixture.nativeElement as HTMLElement;
    const button = nativeElement.querySelector('button');

    expect(button).not.toBeNull();
    expect(button?.hasAttribute('disabled')).toBe(true);
    expect(button?.textContent).toContain('Risoluzione...');
    expect(nativeElement.querySelector('.alarm-item__status')?.textContent).toContain('Operazione in corso');
  });

  it('quando isResolving e false abilita il bottone e non mostra lo stato di avanzamento', () => {
    setInputs(baseAlarm, false);
    const nativeElement = fixture.nativeElement as HTMLElement;
    const button = nativeElement.querySelector('button');

    expect(button).not.toBeNull();
    expect(button?.hasAttribute('disabled')).toBe(false);
    expect(button?.textContent).toContain('Risolvi');
    expect(nativeElement.querySelector('.alarm-item__status')).toBeNull();
  });

  it('click sul bottone invia evento resolve con alarm.id', () => {
    setInputs(baseAlarm);
    const emitSpy = vi.spyOn(component.resolve, 'emit');
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');

    button?.dispatchEvent(new MouseEvent('click'));

    expect(emitSpy).toHaveBeenCalledWith('active-1');
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});
