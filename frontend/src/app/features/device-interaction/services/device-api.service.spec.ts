import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { beforeEach, describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { DeviceApiService } from './device-api.service';

describe('DeviceApiService', () => {
  let service: DeviceApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DeviceApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
      ],
    });

    service = TestBed.inject(DeviceApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('mappa i datapoint dal payload plant nella stanza richiesta', async () => {
    const roomPromise = firstValueFrom(service.getRoom('room-1'));

    const request = httpMock.expectOne('http://localhost:3000/plant?plantid=plant-1');
    expect(request.request.method).toBe('GET');

    request.flush({
      id: 'plant-1',
      name: 'Plant Demo',
      rooms: [
        {
          id: 'room-1',
          name: 'Soggiorno',
          devices: [
            {
              id: 'device-1',
              name: 'Luce principale',
              type: 'SF_Light',
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
        },
      ],
    });

    const room = await roomPromise;
    expect(room.id).toBe('room-1');
    expect(room.devices).toHaveLength(1);
    expect(room.devices[0].datapoints).toHaveLength(1);
    expect(room.devices[0].datapoints[0]).toEqual({
      id: 'dp-1',
      name: 'On/Off',
      readable: true,
      writable: true,
      valueType: 'string',
      enum: ['Off', 'On'],
      sfeType: 'SFE_Cmd_OnOff',
    });
  });

  it('invia la scrittura datapoint su POST /api/device con payload corretto', async () => {
    const writePromise = firstValueFrom(
      service.writeDatapointValue({ datapointId: 'dp-1', value: 'On' }),
    );

    const request = httpMock.expectOne('http://localhost:3000/device');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ datapointId: 'dp-1', value: 'On' });

    request.flush({ message: 'Datapoint value updated successfully', statusCode: 202 });

    await writePromise;
  });

  it('propaga errore quando la scrittura datapoint fallisce', async () => {
    const writePromise = firstValueFrom(
      service.writeDatapointValue({ datapointId: 'dp-1', value: 'On' }),
    );

    const request = httpMock.expectOne('http://localhost:3000/device');
    request.flush({ message: 'failure' }, { status: 503, statusText: 'Service Unavailable' });

    await expect(writePromise).rejects.toBeTruthy();
  });

  it('mappa le righe endpoint scrivibili includendo sfeType e tipo corretto', async () => {
    const rowsPromise = firstValueFrom(service.getWritableEndpointRows());

    const request = httpMock.expectOne('http://localhost:3000/plant?plantid=plant-1');
    expect(request.request.method).toBe('GET');

    request.flush({
      id: 'plant-1',
      name: 'Plant Demo',
      rooms: [
        {
          id: 'room-1',
          name: 'Soggiorno',
          devices: [
            {
              id: 'device-thermo-like',
              name: 'Dispositivo ambiguo',
              type: 'SF_Light',
              subType: 'SS_Unknown',
              datapoints: [
                {
                  id: 'dp-mode-1',
                  name: 'SFE_Cmd_ChangeOverMode',
                  readable: true,
                  writable: true,
                  valueType: 'string',
                  enum: ['Cool', 'Heat'],
                  sfeType: 'SFE_Cmd_ChangeOverMode',
                },
              ],
            },
          ],
        },
      ],
    });

    const rows = await rowsPromise;

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      roomId: 'room-1',
      deviceId: 'device-thermo-like',
      datapointId: 'dp-mode-1',
      datapointSfeType: 'SFE_Cmd_ChangeOverMode',
      deviceType: 'THERMOSTAT',
    });
  });

  it('non mappa come luce una porta di ingresso con tipo ambiguo', async () => {
    const rowsPromise = firstValueFrom(service.getWritableEndpointRows());

    const request = httpMock.expectOne('http://localhost:3000/plant?plantid=plant-1');
    expect(request.request.method).toBe('GET');

    request.flush({
      id: 'plant-1',
      name: 'Plant Demo',
      rooms: [
        {
          id: 'room-entry',
          name: 'Ingresso',
          devices: [
            {
              id: 'device-entry-door',
              name: 'Porta di Ingresso',
              type: 'SF_Light',
              subType: 'SS_Unknown',
              datapoints: [
                {
                  id: 'dp-entry-1',
                  name: 'SFE_Cmd_OnOff',
                  readable: true,
                  writable: true,
                  valueType: 'string',
                  enum: ['Off', 'On'],
                  sfeType: 'SFE_Cmd_OnOff',
                },
              ],
            },
          ],
        },
      ],
    });

    const rows = await rowsPromise;

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      deviceId: 'device-entry-door',
      datapointSfeType: 'SFE_Cmd_OnOff',
      deviceType: 'ENTRANCE_DOOR',
    });
  });
});
