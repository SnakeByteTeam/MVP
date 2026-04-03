import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';

export interface AlarmConfigFormValue {
    name: string;
    apartmentId: string;
    sensorId: string;
    priority: AlarmPriority | null;
    thresholdOperator: ThresholdOperator | null;
    threshold: number | null;
    activationTime: string;
    deactivationTime: string;
    enabled: boolean;
}
