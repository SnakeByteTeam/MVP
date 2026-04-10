import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DeviceCardComponent } from 'src/app/features/device-interaction/components/device-card/device-card.component';
import { DeviceType } from 'src/app/features/device-interaction/models/device-type.enum';
import type { Device } from 'src/app/features/apartment-monitor/models/device.model';
import type { Datapoint } from 'src/app/features/apartment-monitor/models/datapoint.model';

describe('DeviceCardComponent', () => {
  let fixture: ComponentFixture<DeviceCardComponent>;
  let component: DeviceCardComponent;

  const writableDatapoint: Datapoint = {
    id: 'dp-writable',
    name: 'Power',
    readable: true,
    writable: true,
    valueType: 'enum',
    enum: ['OFF', 'ON'],
    sfeType: 'SFE_Cmd_OnOff',
  };

  const readonlyDatapoint: Datapoint = {
    id: 'dp-readonly',
    name: 'Status',
    readable: true,
    writable: false,
    valueType: 'string',
    enum: [],
    sfeType: 'SFE_Status',
  };

  const baseDevice: Device = {
    id: 'device-1',
    name: 'Luce camera',
    type: DeviceType.LIGHT,
    status: 'ONLINE',
    actions: [],
    datapoints: [writableDatapoint, readonlyDatapoint],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('device', baseDevice);
    fixture.detectChanges();
  });

  it('filtra solo datapoint scrivibili con valori enum', () => {
    const writable = component.getWritableEnumDatapoints();

    expect(writable).toHaveLength(1);
    expect(writable[0].id).toBe('dp-writable');
    expect(component.hasWritableDatapoints()).toBe(true);
  });

  it('getSelectedValue usa fallback iniziale e poi mantiene il valore selezionato', () => {
    const firstRead = component.getSelectedValue('dp-writable', ['OFF', 'ON']);

    expect(firstRead).toBe('OFF');

    component.onSelectionChange('dp-writable', 'ON');
    const secondRead = component.getSelectedValue('dp-writable', ['OFF', 'ON']);

    expect(secondRead).toBe('ON');
  });

  it('onWriteDatapoint non emette se isExecuting e true', () => {
    fixture.componentRef.setInput('isExecuting', true);
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.datapointWriteRequested, 'emit');
    component.onWriteDatapoint('dp-writable', ['OFF', 'ON']);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('onWriteDatapoint non emette se non c e valore selezionabile', () => {
    const emitSpy = vi.spyOn(component.datapointWriteRequested, 'emit');
    component.onWriteDatapoint('dp-empty', []);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('onWriteDatapoint emette payload completo quando c e un valore', () => {
    component.onSelectionChange('dp-writable', 'ON');
    const emitSpy = vi.spyOn(component.datapointWriteRequested, 'emit');

    component.onWriteDatapoint('dp-writable', ['OFF', 'ON']);

    expect(emitSpy).toHaveBeenCalledWith({
      roomId: 'room-1',
      deviceId: 'device-1',
      datapointId: 'dp-writable',
      value: 'ON',
    });
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('espone label non vuote per tipo e datapoint', () => {
    expect(component.getTypeLabel(DeviceType.LIGHT).length).toBeGreaterThan(0);
    expect(component.getDatapointLabel(writableDatapoint).length).toBeGreaterThan(0);
  });
});