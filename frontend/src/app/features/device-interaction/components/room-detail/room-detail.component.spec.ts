import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { DeviceCardComponent } from '../device-card/device-card.component';
import { RoomDetailComponent } from './room-detail.component';
import { DeviceApiService } from '../../services/device-api.service';

describe('RoomDetailComponent', () => {
  let component: RoomDetailComponent;
  let fixture: ComponentFixture<RoomDetailComponent>;

  const roomResponse = {
    id: 'living-room',
    name: 'Soggiorno',
    hasActiveAlarm: false,
    devices: [
      {
        id: 'device-1',
        name: 'Luce',
        type: 3,
        status: 'ONLINE' as const,
        actions: [],
        datapoints: [
          {
            id: 'dp-1',
            name: 'On/Off',
            readable: true,
            writable: true,
            valueType: 'string',
            enum: ['Off', 'On'],
            sfeType: 'SFE_Cmd_OnOff',
          },
        ],
      },
    ],
  };

  const routeStub = {
    paramMap: of(convertToParamMap({ roomId: 'living-room' })),
  };

  const deviceApiMock = {
    getRoom: vi.fn().mockReturnValue(of(roomResponse)),
    writeDatapointValue: vi.fn().mockReturnValue(of(void 0)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RoomDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: DeviceApiService, useValue: deviceApiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(deviceApiMock.getRoom).toHaveBeenCalledWith('living-room');
  });

  it('riceve evento dal device-card e invia la write al service', () => {
    const card = fixture.debugElement.query(By.directive(DeviceCardComponent)).componentInstance as DeviceCardComponent;

    card.datapointWriteRequested.emit({
      roomId: 'living-room',
      deviceId: 'device-1',
      datapointId: 'dp-1',
      value: 'On',
    });

    expect(deviceApiMock.writeDatapointValue).toHaveBeenCalledWith({ datapointId: 'dp-1', value: 'On' });
  });

  it('triggera refresh stanza dopo write completata con successo', () => {
    component.onDatapointWriteRequested({
      roomId: 'living-room',
      deviceId: 'device-1',
      datapointId: 'dp-1',
      value: 'On',
    });

    expect(deviceApiMock.getRoom.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(component.writeError).toBeNull();
    expect(component.isExecuting).toBe(false);
  });

  it('imposta errore utente quando la write fallisce', () => {
    deviceApiMock.writeDatapointValue.mockReturnValueOnce(
      throwError(() => new Error('write failed')),
    );

    component.onDatapointWriteRequested({
      roomId: 'living-room',
      deviceId: 'device-1',
      datapointId: 'dp-1',
      value: 'On',
    });

    expect(component.writeError).toBe('Impossibile inviare il comando al dispositivo.');
    expect(component.isExecuting).toBe(false);
  });
});
