import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';

export interface AlarmConfigFormValue {
    name: string;
    plantId: string;
    sensorId: string;
    priority: AlarmPriority | null;
    thresholdOperator: ThresholdOperator | null;
    thresholdValue: string;
    armingTime: string;
    dearmingTime: string;
    enabled: boolean;
}
