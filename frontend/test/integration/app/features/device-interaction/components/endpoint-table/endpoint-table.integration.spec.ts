import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceType } from 'src/app/features/device-interaction/models/device-type.enum';
import { WritableEndpointRow } from 'src/app/features/device-interaction/models/writable-endpoint-row.model';
import { DeviceApiService } from 'src/app/features/device-interaction/services/device-api.service';
import { DeviceValuePointDto } from 'src/app/features/device-interaction/models/write-datapoint-request.model';
import { EndpointTableComponent } from 'src/app/features/device-interaction/components/endpoint-table/endpoint-table.component';

describe('DeviceInteraction feature integration', () => {
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

    const deviceApiStub = {
        getWritableEndpointRows: vi.fn().mockReturnValue(of([mappedRow, unknownRow])),
        getCurrentValuePointsByDeviceIds: vi.fn().mockReturnValue(of(currentValuesByDevice)),
        writeDatapointValue: vi.fn().mockReturnValue(of(void 0)),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        await TestBed.configureTestingModule({
            imports: [EndpointTableComponent],
            providers: [{ provide: DeviceApiService, useValue: deviceApiStub }],
        }).compileComponents();

        fixture = TestBed.createComponent(EndpointTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('RF79-OBL carica endpoint scrivibili e valori correnti alla init', () => {
        expect(component).toBeTruthy();
        expect(deviceApiStub.getWritableEndpointRows).toHaveBeenCalledTimes(1);
        expect(deviceApiStub.getCurrentValuePointsByDeviceIds).toHaveBeenCalledTimes(1);
    });

    it('RF80-OBL espone label endpoint leggibili per sfeType noti e ignoti', () => {
        expect(component.getEndpointLabel(mappedRow)).toBe('Comando cambio modalita HVAC');
        expect(component.getEndpointLabel(unknownRow)).toBe('Comando future feature');
    });

    it('RF81-OBL risolve valore corrente dal datapoint state corrispondente', () => {
        expect(component.getCurrentValue(mappedRow)).toBe('Heat');
        expect(component.getCurrentValue(unknownRow)).toBe('-');
    });
});
