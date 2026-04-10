import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Datapoint } from 'src/app/features/apartment-monitor/models/datapoint.model';
import { AlarmConfigFormFieldOrchestratorHelper } from 'src/app/features/alarm-configuration/helpers/alarm-config-form-field-orchestrator.helper';

describe('AlarmConfigFormFieldOrchestratorHelper', () => {
    let helper: AlarmConfigFormFieldOrchestratorHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [AlarmConfigFormFieldOrchestratorHelper] });
        helper = TestBed.inject(AlarmConfigFormFieldOrchestratorHelper);
    });

    it('applyModeState in edit mode disabilita campi non modificabili', () => {
        const formLike = {
            controls: {
                name: new FormControl('Name', { nonNullable: true }),
                plantId: new FormControl('plant-1', { nonNullable: true }),
                deviceId: new FormControl('device-1', { nonNullable: true }),
                datapointId: new FormControl('dp-1', { nonNullable: true }),
                thresholdOperator: new FormControl('>', { nonNullable: true }),
            },
        };

        helper.applyModeState(formLike, 'edit');

        expect(formLike.controls.name.disabled).toBe(true);
        expect(formLike.controls.plantId.disabled).toBe(true);
        expect(formLike.controls.deviceId.disabled).toBe(true);
        expect(formLike.controls.datapointId.disabled).toBe(true);
        expect(formLike.controls.thresholdOperator.disabled).toBe(true);
    });

    it('resolveDeviceSelection ritorna solo datapoint leggibili e auto-selezione se singolo', () => {
        const readableDatapoint: Datapoint = {
            id: 'dp-readable',
            name: 'Readable',
            readable: true,
            writable: false,
            valueType: 'string',
            enum: ['On', 'Off'],
            sfeType: 'SFE_State',
        };
        const notReadableDatapoint: Datapoint = {
            id: 'dp-command',
            name: 'Command',
            readable: false,
            writable: true,
            valueType: 'string',
            enum: ['On', 'Off'],
            sfeType: 'SFE_Cmd',
        };

        const selection = helper.resolveDeviceSelection('device-1', [
            {
                id: 'device-1',
                label: 'Room - Device',
                datapoints: [readableDatapoint, notReadableDatapoint],
            },
        ]);

        expect(selection.normalizedDeviceId).toBe('device-1');
        expect(selection.readableDatapoints).toEqual([readableDatapoint]);
        expect(selection.autoSelectedDatapointId).toBe('dp-readable');
    });

    it('resolveDatapointSelection normalizza id e restituisce il datapoint atteso', () => {
        const datapoint: Datapoint = {
            id: 'dp-1',
            name: 'Datapoint',
            readable: true,
            writable: false,
            valueType: 'string',
            enum: [],
            sfeType: 'SFE',
        };

        const selection = helper.resolveDatapointSelection('  dp-1  ', [datapoint]);

        expect(selection.normalizedDatapointId).toBe('dp-1');
        expect(selection.selectedDatapoint).toEqual(datapoint);
    });
});
