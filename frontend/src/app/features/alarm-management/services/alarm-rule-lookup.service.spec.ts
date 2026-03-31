import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import type { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';
import { AlarmRuleLookupService } from './alarm-rule-lookup.service';

describe('AlarmRuleLookupService', () => {
    let service: AlarmRuleLookupService;

    const alarmApiStub = {
        getAlarmRule: vi.fn(),
    };

    const alarmRule: AlarmRule = {
        id: 'rule-1',
        name: 'Rule 1',
        apartmentId: 'apt-1',
        deviceId: 'device-1',
        priority: AlarmPriority.RED,
        thresholdOperator: ThresholdOperator.GREATER_THAN,
        threshold: 10,
        activationTime: '08:00',
        deactivationTime: '20:00',
        enabled: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        TestBed.configureTestingModule({
            providers: [
                AlarmRuleLookupService,
                { provide: AlarmApiService, useValue: alarmApiStub },
            ],
        });

        service = TestBed.inject(AlarmRuleLookupService);
    });

    it('usa cache per evitare chiamate duplicate sulla stessa regola', async () => {
        alarmApiStub.getAlarmRule.mockReturnValue(of(alarmRule));

        const first = await firstValueFrom(service.getAlarmRuleById('rule-1'));
        const second = await firstValueFrom(service.getAlarmRuleById('rule-1'));

        expect(first).toEqual(alarmRule);
        expect(second).toEqual(alarmRule);
        expect(alarmApiStub.getAlarmRule).toHaveBeenCalledTimes(1);
        expect(alarmApiStub.getAlarmRule).toHaveBeenCalledWith('rule-1');
    });

    it('ritorna null in caso di errore API', async () => {
        alarmApiStub.getAlarmRule.mockReturnValue(throwError(() => new Error('not found')));

        const result = await firstValueFrom(service.getAlarmRuleById('rule-x'));

        expect(result).toBeNull();
        expect(alarmApiStub.getAlarmRule).toHaveBeenCalledWith('rule-x');
    });
});
