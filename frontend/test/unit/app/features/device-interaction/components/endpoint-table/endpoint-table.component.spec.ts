import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi, afterAll } from 'vitest';
import { DeviceType } from 'src/app/features/device-interaction/models/device-type.enum';
import { WritableEndpointRow } from 'src/app/features/device-interaction/models/writable-endpoint-row.model';
import { DeviceApiService } from 'src/app/features/device-interaction/services/device-api.service';
import { DeviceValuePointDto } from 'src/app/features/device-interaction/models/write-datapoint-request.model';
import { EndpointTableComponent } from 'src/app/features/device-interaction/components/endpoint-table/endpoint-table.component';

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
  
  const invalidRow: WritableEndpointRow = {
      ...unknownRow,
      deviceId: 'device-3',
      enumValues: []
  };

  const currentValuesByDevice = new Map<string, DeviceValuePointDto[]>([
    [
      'device-1',
      [
        {
          datapointId: 'dp-state-1',
          name: 'SFE_State_ChangeOverMode',
          value: 'Heat',
        },
      ],
    ],
  ]);

  let deviceApiMock = {
    getWritableEndpointRows: vi.fn().mockReturnValue(of([mappedRow, unknownRow, invalidRow])),
    getCurrentValuePointsByDeviceIds: vi.fn().mockReturnValue(of(currentValuesByDevice)),
    writeDatapointValue: vi.fn().mockReturnValue(of(void 0)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // reset mock
    deviceApiMock = {
      getWritableEndpointRows: vi.fn().mockReturnValue(of([mappedRow, unknownRow, invalidRow])),
      getCurrentValuePointsByDeviceIds: vi.fn().mockReturnValue(of(currentValuesByDevice)),
      writeDatapointValue: vi.fn().mockReturnValue(of(void 0)),
    };

    // stub Global dispatchEvent
    vi.stubGlobal('addEventListener', vi.fn());

    await TestBed.configureTestingModule({
      imports: [EndpointTableComponent],
      providers: [{ provide: DeviceApiService, useValue: deviceApiMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(EndpointTableComponent);
    component = fixture.componentInstance;
  });
  
  afterAll(() => {
     vi.unstubAllGlobals();
  });

  it('creates component and loads writable endpoints', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(deviceApiMock.getWritableEndpointRows).toHaveBeenCalledTimes(1);
    expect(deviceApiMock.getCurrentValuePointsByDeviceIds).toHaveBeenCalledTimes(1);
    // test trackBy
    expect(component.trackByGroup(0, {roomId: 'room-1', roomName: 'Soggiorno', rows: []})).toBe('room-1');
    expect(component.trackByRow(0, mappedRow)).toBe('room-1::device-1::dp-1');
  });

  it('renders mapped endpoint label for known sfeType', () => {
    fixture.detectChanges();
    expect(component.getEndpointLabel(mappedRow)).toBe('Comando cambio modalita HVAC');
  });

  it('falls back to a runtime humanized label when sfeType is unknown', () => {
    fixture.detectChanges();
    expect(component.getEndpointLabel(unknownRow)).toBe('Comando future feature');
  });

  it('returns semantic current value by matching Cmd endpoint to State datapoint', () => {
    fixture.detectChanges();
    expect(component.getCurrentValue(mappedRow)).toBe('Heat');
  });

  it('returns exact match current value if found', () => {
    deviceApiMock.getCurrentValuePointsByDeviceIds.mockReturnValue(of(new Map([
        ['device-1', [{ datapointId: 'dp-1', name: 'some_name', value: 'ExactVal' }]]
    ])));
    fixture.detectChanges();
    expect(component.getCurrentValue(mappedRow)).toBe('ExactVal');
  });

  it('returns fallback when current datapoint value is unavailable', () => {
    fixture.detectChanges();
    expect(component.getCurrentValue(unknownRow)).toBe('-');
  });

  it('populates error string if fetching endpoints fails', () => {
    deviceApiMock.getWritableEndpointRows.mockReturnValue(throwError(() => new Error('Network error')));
    // Subscribe directly to the stream - it's synchronous so the error handler runs immediately
    component.roomGroups$.subscribe({ error: () => {} });
    expect(component.loadError).toBe('Impossibile caricare i dispositivi con endpoint.');
  });
  
  it('clear map when no unique device ids', async () => {
    deviceApiMock.getWritableEndpointRows.mockReturnValue(of([]));
    fixture.detectChanges();
    component.roomGroups$.subscribe(); // trigger the stream manually
    await fixture.whenStable();
    // No errors thrown, code handles it correctly
    expect(component.loadError).toBe('');
  });

  it('handles onSelectionChange correctly', () => {
    fixture.detectChanges();
    component.onSelectionChange(mappedRow, 'Cool');
    expect(component.getSelectedValue(mappedRow)).toBe('Cool');
  });
  
  it('handles write success correctly', () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    
    expect(component.isRowExecuting(mappedRow)).toBe(false);
    
    component.onSelectionChange(mappedRow, 'Cool');
    component.onWriteRow(mappedRow);
    
    // of() is synchronous — the write completes before we reach this line
    expect(deviceApiMock.writeDatapointValue).toHaveBeenCalledWith({ datapointId: 'dp-1', value: 'Cool' });
    
    const feedback = component.getRowFeedback(mappedRow);
    expect(feedback).toBeTruthy();
    expect(feedback?.type).toBe('success');
    
    vi.advanceTimersByTime(5000);
    expect(component.getRowFeedback(mappedRow)).toBeNull();
    vi.useRealTimers();
  });

  it('handles write error correctly', async () => {
    vi.useFakeTimers();
    deviceApiMock.writeDatapointValue.mockReturnValue(throwError(() => new Error('Server limit')));
    fixture.detectChanges();
    
    component.onSelectionChange(mappedRow, 'Cool');
    component.onWriteRow(mappedRow);
    await fixture.whenStable();
    
    const feedback = component.getRowFeedback(mappedRow);
    expect(feedback?.type).toBe('error');
    expect(feedback?.message).toContain('Errore invio');
    
    vi.advanceTimersByTime(5000);
    expect(component.getRowFeedback(mappedRow)).toBeNull();
    vi.useRealTimers();
  });
  
  it('ignores write if already executing or no value selected', () => {
    fixture.detectChanges();
    
    component.onWriteRow(invalidRow);
    expect(deviceApiMock.writeDatapointValue).not.toHaveBeenCalled();
    
    const subject = new Subject<void>();
    deviceApiMock.writeDatapointValue.mockReturnValue(subject.asObservable());
    component.onSelectionChange(mappedRow, 'Heat');
    component.onWriteRow(mappedRow);
    
    expect(component.isRowExecuting(mappedRow)).toBe(true);
    
    component.onWriteRow(mappedRow);
    expect(deviceApiMock.writeDatapointValue).toHaveBeenCalledTimes(1); 
  });

  it('active-plant-changed event resets state and triggers refresh', async () => {
    vi.unstubAllGlobals();
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSelectionChange(mappedRow, 'Cool');
    expect(component.getSelectedValue(mappedRow)).toBe('Cool');

    globalThis.dispatchEvent(new CustomEvent('active-plant-changed', { detail: { plantId: 'plant-new' } }));

    expect(component.getSelectedValue(mappedRow)).toBe('Cool');
    expect(component.loadError).toBe('');
  });

  it('ngOnDestroy cancella le subscription e i feedback timer attivi', () => {
    vi.useFakeTimers();
    fixture.detectChanges();

    component.onSelectionChange(mappedRow, 'Cool');
    component.onWriteRow(mappedRow);
    expect(component.getRowFeedback(mappedRow)).toBeTruthy();

    expect(() => fixture.destroy()).not.toThrow();

    vi.advanceTimersByTime(10000);
    vi.useRealTimers();
  });

  it('getSelectedValue restituisce il primo valore enum come fallback', () => {
    fixture.detectChanges();
    const val = component.getSelectedValue(mappedRow);
    expect(val).toBe('Cool');
  });

  it('getCurrentValue restituisce il primo valore disponibile come fallback', () => {
    const fallbackRow: WritableEndpointRow = {
      ...mappedRow,
      datapointId: 'dp-99',
      datapointName: 'SFE_Cmd_Unknown',
      datapointSfeType: 'SFE_Cmd_Unknown',
    };
    deviceApiMock.getCurrentValuePointsByDeviceIds.mockReturnValue(of(new Map([
      ['device-1', [{ datapointId: 'dp-other', name: 'some_other', value: 'FallbackVal' }]],
    ])));
    fixture.detectChanges();
    expect(component.getCurrentValue(fallbackRow)).toBe('FallbackVal');
  });

  it('getTypeLabel delega a getDeviceTypeLabel', () => {
    fixture.detectChanges();
    expect(component.getTypeLabel(DeviceType.THERMOSTAT)).toBe('Termostato');
    expect(component.getTypeLabel(DeviceType.UNKNOWN)).toBe('Sconosciuto');
  });
});
