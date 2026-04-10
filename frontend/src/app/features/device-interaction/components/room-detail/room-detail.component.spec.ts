import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { DeviceType } from '../../models/device-type.enum';
import { WritableEndpointRow } from '../../models/writable-endpoint-row.model';
import { DeviceApiService } from '../../services/device-api.service';
import { RoomDetailComponent } from './room-detail.component';
import { EndpointTableComponent } from '../endpoint-table/endpoint-table.component';


@Component({
  selector: 'app-endpoint-table',
  standalone: true,
  template: '<div class="endpoint-table-stub"></div>',
})
class EndpointTableStubComponent {}

describe('RoomDetailComponent', () => {
  let component: RoomDetailComponent;
  let fixture: ComponentFixture<RoomDetailComponent>;

  const endpointRow: WritableEndpointRow = {
    roomId: 'living-room',
    roomName: 'Soggiorno',
    deviceId: 'device-1',
    deviceName: 'Luce',
    deviceType: DeviceType.LIGHT,
    datapointId: 'dp-1',
    datapointName: 'On/Off',
    datapointSfeType: 'SFE_Cmd_OnOff',
    enumValues: ['Off', 'On'],
  };

  const deviceApiMock = {
    getWritableEndpointRows: vi.fn().mockReturnValue(of([endpointRow])),
    writeDatapointValue: vi.fn().mockReturnValue(of(void 0)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RoomDetailComponent],
      providers: [
        provideRouter([]),
        { provide: DeviceApiService, useValue: deviceApiMock },
      ],
    })
      .overrideComponent(RoomDetailComponent, {
        remove: { imports: [EndpointTableComponent] },
        add: { imports: [EndpointTableStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RoomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra il titolo panoramica della pagina', () => {
    const heading = fixture.nativeElement.querySelector('h1')?.textContent ?? '';
    expect(heading).toContain('Panoramica allarmi e dispositivi');
  });

  it('renderizza la tabella endpoint embedded', () => {
    const endpointTable = fixture.nativeElement.querySelector('app-endpoint-table');
    expect(endpointTable).toBeTruthy();
  });
});
