import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { DeviceType } from 'src/app/features/device-interaction/models/device-type.enum';
import type { Device } from 'src/app/features/apartment-monitor/models/device.model';
import { AlarmButtonCardComponent } from 'src/app/features/device-interaction/components/alarm-button-card/alarm-button-card.component';
import { BlindCardComponent } from 'src/app/features/device-interaction/components/blind-card/blind-card.component';
import { EntranceDoorCardComponent } from 'src/app/features/device-interaction/components/entrance-door-card/entrance-door-card.component';
import { FallSensorCardComponent } from 'src/app/features/device-interaction/components/fall-sensor-card/fall-sensor-card.component';
import { LightCardComponent } from 'src/app/features/device-interaction/components/light-card/light-card.component';
import { PresenceSensorCardComponent } from 'src/app/features/device-interaction/components/presence-sensor-card/presence-sensor-card.component';
import { ThermostatCardComponent } from 'src/app/features/device-interaction/components/thermostat-card/thermostat-card.component';

type ActionCardComponentType = Type<
  | AlarmButtonCardComponent
  | BlindCardComponent
  | EntranceDoorCardComponent
  | FallSensorCardComponent
  | LightCardComponent
  | PresenceSensorCardComponent
  | ThermostatCardComponent
>;

const baseDevice: Device = {
  id: 'device-1',
  name: 'Device One',
  type: DeviceType.LIGHT,
  status: 'ONLINE',
  actions: [],
  datapoints: [],
};

const actionCardCases: Array<{ name: string; componentType: ActionCardComponentType }> = [
  { name: 'AlarmButtonCardComponent', componentType: AlarmButtonCardComponent },
  { name: 'BlindCardComponent', componentType: BlindCardComponent },
  { name: 'EntranceDoorCardComponent', componentType: EntranceDoorCardComponent },
  { name: 'FallSensorCardComponent', componentType: FallSensorCardComponent },
  { name: 'LightCardComponent', componentType: LightCardComponent },
  { name: 'PresenceSensorCardComponent', componentType: PresenceSensorCardComponent },
  { name: 'ThermostatCardComponent', componentType: ThermostatCardComponent },
];

async function setupActionCardFixture<T>(componentType: Type<T>): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [componentType],
  }).compileComponents();

  const fixture = TestBed.createComponent(componentType);
  fixture.componentRef.setInput('roomId', 'room-1');
  fixture.componentRef.setInput('device', baseDevice);
  fixture.detectChanges();
  return fixture;
}

describe('Action Card Components', () => {
  for (const testCase of actionCardCases) {
    it(`${testCase.name} emette actionRequested con payload corretto`, async () => {
      const fixture = await setupActionCardFixture(testCase.componentType);
      const component = fixture.componentInstance as {
        onAction: (action: string) => void;
        actionRequested: { emit: (payload: unknown) => void };
      };
      const emitSpy = vi.spyOn(component.actionRequested, 'emit');

      component.onAction('toggle');

      expect(emitSpy).toHaveBeenCalledWith({
        roomId: 'room-1',
        deviceId: 'device-1',
        action: 'toggle',
      });
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });
  }

  it('ThermostatCardComponent espone una label valida per il tipo', async () => {
    const fixture = await setupActionCardFixture(ThermostatCardComponent);
    const component = fixture.componentInstance;

    expect(component.getTypeLabel(DeviceType.THERMOSTAT)).toBeTypeOf('string');
    expect(component.getTypeLabel(DeviceType.THERMOSTAT).length).toBeGreaterThan(0);
  });
});