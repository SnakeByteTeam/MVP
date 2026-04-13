import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import type { ActiveAlarm } from 'src/app/core/alarm/models/active-alarm.model';
import { ElapsedTimePipe } from 'src/app/shared/pipes/elapsed-time.pipe';
import { AlarmItemComponent } from 'src/app/features/alarm-management/components/alarm-item-component/alarm-item-component';

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
    activationTime: '2026-03-24T10:00:00.000Z',
    resolutionTime: null,
    position: 'Camera 101',
    userId: 10,
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

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    setInputs(baseAlarm);
    expect(component).toBeTruthy();
  });

  it('priorityUi mappa correttamente label per tutti i livelli', () => {
    setInputs({ ...baseAlarm, priority: AlarmPriority.RED });
    expect(component.vm().priorityLabel).toBe('Alta');

    setInputs({ ...baseAlarm, priority: AlarmPriority.ORANGE });
    expect(component.vm().priorityLabel).toBe('Media');

    setInputs({ ...baseAlarm, priority: AlarmPriority.GREEN });
    expect(component.vm().priorityLabel).toBe('Bassa');

    setInputs({ ...baseAlarm, priority: AlarmPriority.WHITE });
    expect(component.vm().priorityLabel).toBe('Informativa');
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
    const resolveButton = nativeElement.querySelector('button');

    expect(nativeElement.querySelector('.alarm-item__title')?.textContent).toContain('Allarme antipanico in "Camera 101"');
    expect(nativeElement.querySelector('.alarm-item__priority')?.textContent).toContain('Alta');
    expect(metaValues.item(1)?.textContent).toContain('mock-elapsed:2026-03-24T10:00:00.000Z');
    expect(resolveButton?.getAttribute('aria-label')).toContain('Risolvi allarme Allarme antipanico');
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

  it('usa fallback per nome e posizione quando i campi sono vuoti o solo spazi', () => {
    setInputs({
      ...baseAlarm,
      alarmName: '   ',
      position: '   ',
    });

    expect(component.vm().alarmTitle).toBe('senza nome in "posizione sconosciuta"');
    expect(component.vm().articleAriaLabel).toBe('Allarme senza nome');
    expect(component.vm().resolveButtonAriaLabel).toBe('Risolvi allarme senza nome');
  });

  it('quando e in resolving aggiorna aria-label del bottone in modo specifico', () => {
    setInputs(baseAlarm, true);

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');

    expect(component.vm().resolveButtonText).toBe('Risoluzione...');
    expect(button?.getAttribute('aria-label')).toContain('Risoluzione in corso per Allarme antipanico');
  });

  it('renderizza nomi con caratteri speciali come testo senza errori runtime', () => {
    setInputs({
      ...baseAlarm,
      alarmName: '<script>alert("xss")</script>',
      position: 'Sala monitoraggio',
    });

    const title = (fixture.nativeElement as HTMLElement).querySelector('.alarm-item__title')?.textContent ?? '';

    expect(title).toContain('<script>alert("xss")</script> in "Sala monitoraggio"');
  });
});
