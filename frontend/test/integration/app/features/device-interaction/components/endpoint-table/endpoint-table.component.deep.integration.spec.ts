import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceType } from 'src/app/features/device-interaction/models/device-type.enum';
import { WritableEndpointRow } from 'src/app/features/device-interaction/models/writable-endpoint-row.model';
import { DeviceApiService } from 'src/app/features/device-interaction/services/device-api.service';
import { DeviceValuePointDto } from 'src/app/features/device-interaction/models/write-datapoint-request.model';
import { EndpointTableComponent } from 'src/app/features/device-interaction/components/endpoint-table/endpoint-table.component';

describe('EndpointTableComponent deep integration', () => {
  let component: EndpointTableComponent;
  let fixture: ComponentFixture<EndpointTableComponent>;

  const mappedRow: WritableEndpointRow = {
    roomId: 'room-1',
    roomName: 'Soggiorno',
    deviceId: 'device-1',
    deviceName: 'Termostato Living',
    deviceType: DeviceType.THERMOSTAT,
    datapointId: 'dp-cmd-1',
    datapointName: 'SFE_Cmd_ChangeOverMode',
    datapointSfeType: 'SFE_Cmd_ChangeOverMode',
    enumValues: ['Cool', 'Heat'],
  };

  const secondRowSameRoom: WritableEndpointRow = {
    roomId: 'room-1',
    roomName: 'Soggiorno',
    deviceId: 'device-2',
    deviceName: 'Luce corridoio',
    deviceType: DeviceType.LIGHT,
    datapointId: 'dp-cmd-2',
    datapointName: 'SFE_Cmd_OnOff',
    datapointSfeType: 'SFE_Cmd_OnOff',
    enumValues: ['Off', 'On'],
  };

  const deviceApiMock = {
    getWritableEndpointRows: vi.fn(),
    getCurrentValuePointsByDeviceIds: vi.fn(),
    writeDatapointValue: vi.fn(),
  };

  beforeEach(async () => {
    vi.useRealTimers();
    vi.clearAllMocks();

    deviceApiMock.getWritableEndpointRows.mockReturnValue(of([mappedRow, secondRowSameRoom]));
    deviceApiMock.getCurrentValuePointsByDeviceIds.mockReturnValue(
      of(
        new Map<string, DeviceValuePointDto[]>([
          [
            'device-1',
            [{ datapointId: 'dp-state-1', name: 'SFE_State_ChangeOverMode', value: 'Heat' }],
          ],
          ['device-2', [{ datapointId: 'dp-cmd-2', name: 'SFE_Cmd_OnOff', value: 'Off' }]],
        ]),
      ),
    );
    deviceApiMock.writeDatapointValue.mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [EndpointTableComponent],
      providers: [{ provide: DeviceApiService, useValue: deviceApiMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(EndpointTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    vi.useRealTimers();
  });

  it('groupRows creates one group for same room id and trackBy returns stable keys', () => {
    const groups = fixture.nativeElement.querySelectorAll('.endpoint-table__group');

    expect(groups.length).toBe(1);
    expect(component.trackByGroup(0, { roomId: 'room-1', roomName: '', rows: [] })).toBe('room-1');
    expect(component.trackByRow(0, mappedRow)).toContain('room-1::device-1::dp-cmd-1');
  });

  it('getCurrentValue resolves exact datapoint match', () => {
    const exact = component.getCurrentValue(secondRowSameRoom);
    expect(exact).toBe('Off');
  });

  it('getCurrentValue uses first available value when exact and semantic matches are missing', () => {
    const fallbackRow: WritableEndpointRow = {
      ...secondRowSameRoom,
      deviceId: 'device-3',
      datapointId: 'dp-unknown',
      datapointName: 'Unknown_Command_Name',
      datapointSfeType: 'Unknown_Command_Name',
    };

    deviceApiMock.getCurrentValuePointsByDeviceIds.mockReturnValueOnce(
      of(
        new Map<string, DeviceValuePointDto[]>([
          [
            'device-3',
            [
              { datapointId: 'x-1', name: 'x-1', value: 'FallbackValue' },
              { datapointId: 'x-2', name: 'x-2', value: 'SecondValue' },
            ],
          ],
        ]),
      ),
    );
    deviceApiMock.getWritableEndpointRows.mockReturnValueOnce(of([fallbackRow]));

    fixture.destroy();
    fixture = TestBed.createComponent(EndpointTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.getCurrentValue(fallbackRow)).toBe('FallbackValue');
  });

  it('selected values default to first enum and can be changed', () => {
    expect(component.getSelectedValue(mappedRow)).toBe('Cool');

    component.onSelectionChange(mappedRow, 'Heat');

    expect(component.getSelectedValue(mappedRow)).toBe('Heat');
  });

  it('onWriteRow success toggles executing state and exposes success feedback', () => {
    const write$ = new Subject<void>();
    deviceApiMock.writeDatapointValue.mockReturnValueOnce(write$.asObservable());

    component.onSelectionChange(mappedRow, 'Heat');
    component.onWriteRow(mappedRow);

    expect(component.isRowExecuting(mappedRow)).toBe(true);
    expect(deviceApiMock.writeDatapointValue).toHaveBeenCalledWith({
      datapointId: 'dp-cmd-1',
      value: 'Heat',
    });

    write$.next();
    write$.complete();

    expect(component.isRowExecuting(mappedRow)).toBe(false);
    expect(component.getRowFeedback(mappedRow)?.type).toBe('success');
  });

  it('onWriteRow ignores duplicate invocation while row is already executing', () => {
    const write$ = new Subject<void>();
    deviceApiMock.writeDatapointValue.mockReturnValueOnce(write$.asObservable());

    component.onWriteRow(mappedRow);
    component.onWriteRow(mappedRow);

    expect(deviceApiMock.writeDatapointValue).toHaveBeenCalledTimes(1);

    write$.complete();
  });

  it('onWriteRow with no selectable enum value does not call API', () => {
    const rowWithoutEnum: WritableEndpointRow = {
      ...mappedRow,
      datapointId: 'dp-no-enum',
      enumValues: [],
    };

    component.onWriteRow(rowWithoutEnum);

    expect(deviceApiMock.writeDatapointValue).not.toHaveBeenCalled();
  });

  it('onWriteRow error path sets error feedback and clears executing state', () => {
    deviceApiMock.writeDatapointValue.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.onWriteRow(mappedRow);

    expect(component.isRowExecuting(mappedRow)).toBe(false);
    expect(component.getRowFeedback(mappedRow)?.type).toBe('error');
  });

  it('feedback is auto-cleared after timeout', () => {
    vi.useFakeTimers();

    component.onWriteRow(mappedRow);
    expect(component.getRowFeedback(mappedRow)?.type).toBe('success');

    vi.advanceTimersByTime(5001);

    expect(component.getRowFeedback(mappedRow)).toBeNull();
  });

  it('active-plant-changed event resets transient state and triggers a refresh', () => {
    const callsBefore = deviceApiMock.getWritableEndpointRows.mock.calls.length;

    component.onSelectionChange(mappedRow, 'Heat');
    component.loadError = 'manual-error';

    globalThis.dispatchEvent(
      new CustomEvent('active-plant-changed', {
        detail: { plantId: 'plant-2' },
      }),
    );

    expect(component.getSelectedValue(mappedRow)).toBe('Cool');
    expect(component.loadError).toBe('');
    expect(deviceApiMock.getWritableEndpointRows.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('polling periodically reloads current values', () => {
    vi.useFakeTimers();
    fixture.destroy();

    fixture = TestBed.createComponent(EndpointTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const callsBefore = deviceApiMock.getCurrentValuePointsByDeviceIds.mock.calls.length;

    vi.advanceTimersByTime(15000);

    expect(deviceApiMock.getCurrentValuePointsByDeviceIds.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('load current values error branch keeps component usable and returns fallback dash', () => {
    deviceApiMock.getCurrentValuePointsByDeviceIds.mockReturnValueOnce(
      throwError(() => new Error('network')),
    );

    fixture.destroy();
    fixture = TestBed.createComponent(EndpointTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.getCurrentValue(mappedRow)).toBe('-');
  });
});
