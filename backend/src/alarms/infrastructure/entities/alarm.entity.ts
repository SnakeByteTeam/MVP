// rappresentano righe delle tabelle alarm e active_alarm nel database

export interface AlarmEntity {
  id: string;
  name: string;
  plant_id: string;
  device_id: string;
  priority: string;
  threshold: number;
  activation_time: string;
  deactivation_time: string;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}
 
export interface ActiveAlarmEntity {
  id: string;
  alarm_rule_id: string;
  alarm_name: string;
  danger_signal: string;
  triggered_at: Date;
  resolved_at: Date | null;
}
 
