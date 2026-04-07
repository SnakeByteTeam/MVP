import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceType } from '../../models/device-type.enum';
import { WritableEndpointRow } from '../../models/writable-endpoint-row.model';
import { DeviceApiService } from '../../services/device-api.service';
import { EndpointTableComponent } from './endpoint-table.component';

describe('EndpointTableComponent', () => {
  let component: EndpointTableComponent;
  let fixture: ComponentFixture<EndpointTableComponent>;

  const mappedRow: WritableEndpointRow = {
    roomId: 'room-1',
    roomName: 'Soggiorno',
    deviceId: 'device-1',
    deviceName: 'Termostato Living',
    deviceType: DeviceType.THERMOSTAT,
    datapointId: 'dp-1',
    datapointName: 'SFE_Cmd_ChangeOverMode',
    datapointSfeType: 'SFE_Cmd_ChangeOverMode',
    enumValues: ['Cool', 'Heat'],
  };

  const unknownRow: WritableEndpointRow = {
    roomId: 'room-1',
    roomName: 'Soggiorno',
    deviceId: 'device-2',
    deviceName: 'Dispositivo Nuovo',
    deviceType: DeviceType.LIGHT,
    datapointId: 'dp-2',
    datapointName: 'SFE_Cmd_FutureFeature',
    datapointSfeType: 'SFE_Cmd_FutureFeature',
    enumValues: ['Off', 'On'],
  };

  const deviceApiMock = {
    getWritableEndpointRows: vi.fn().mockReturnValue(of([mappedRow, unknownRow])),
    writeDatapointValue: vi.fn().mockReturnValue(of(void 0)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [EndpointTableComponent],
      providers: [{ provide: DeviceApiService, useValue: deviceApiMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(EndpointTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component and loads writable endpoints', () => {
    expect(component).toBeTruthy();
    expect(deviceApiMock.getWritableEndpointRows).toHaveBeenCalledTimes(1);
  });

  it('renders mapped endpoint label for known sfeType', () => {
    expect(component.getEndpointLabel(mappedRow)).toBe('Comando cambio modalita HVAC');
  });

  it('falls back to a runtime humanized label when sfeType is unknown', () => {
    expect(component.getEndpointLabel(unknownRow)).toBe('Comando future feature');
  });
});
