import { AlarmEvent } from 'src/alarms/domain/models/alarm-event.model';
import { AlarmPriority } from 'src/alarms/domain/models/alarm-priority.enum';

describe('AlarmEvent', () => {
  let alarmEvent: AlarmEvent;
  const testData = {
    id: 'alarm-1',
    position: 'Ward A - Room 101',
    alarmRuleId: 'rule-123',
    alarmName: 'High Temperature',
    priority: AlarmPriority.WHITE,
    activationTime: new Date('2026-04-12T10:00:00Z'),
    resolutionTime: new Date('2026-04-12T11:00:00Z'),
    userId: 5,
    userUsername: 'nurse_john',
  };

  beforeEach(() => {
    alarmEvent = new AlarmEvent(
      testData.id,
      testData.position,
      testData.alarmRuleId,
      testData.alarmName,
      testData.priority,
      testData.activationTime,
      testData.resolutionTime,
      testData.userId,
      testData.userUsername,
    );
  });

  it('should be defined', () => {
    expect(alarmEvent).toBeDefined();
  });

  describe('getId', () => {
    it('should return the alarm event id', () => {
      expect(alarmEvent.getId()).toBe('alarm-1');
    });

    it('should return the correct id type', () => {
      expect(typeof alarmEvent.getId()).toBe('string');
    });
  });

  describe('getPosition', () => {
    it('should return the position', () => {
      expect(alarmEvent.getPosition()).toBe('Ward A - Room 101');
    });
  });

  describe('getAlarmRuleId', () => {
    it('should return the alarm rule id', () => {
      expect(alarmEvent.getAlarmRuleId()).toBe('rule-123');
    });
  });

  describe('getAlarmName', () => {
    it('should return the alarm name', () => {
      expect(alarmEvent.getAlarmName()).toBe('High Temperature');
    });
  });

  describe('getPriority', () => {
    it('should return the priority', () => {
      expect(alarmEvent.getPriority()).toBe(AlarmPriority.WHITE);
    });

    it('should return the correct priority enum value', () => {
      const lowPriorityAlarm = new AlarmEvent(
        'alarm-2',
        'Ward B',
        'rule-456',
        'Low Alert',
        AlarmPriority.WHITE,
        testData.activationTime,
        null,
        null,
        null,
      );
      expect(lowPriorityAlarm.getPriority()).toBe(AlarmPriority.WHITE);
    });
  });

  describe('getActivationTime', () => {
    it('should return the activation time', () => {
      expect(alarmEvent.getActivationTime()).toEqual(
        new Date('2026-04-12T10:00:00Z'),
      );
    });

    it('should return a Date object', () => {
      expect(alarmEvent.getActivationTime()).toBeInstanceOf(Date);
    });
  });

  describe('getResolutionTime', () => {
    it('should return the resolution time when present', () => {
      expect(alarmEvent.getResolutionTime()).toEqual(
        new Date('2026-04-12T11:00:00Z'),
      );
    });

    it('should return null when alarm is not resolved', () => {
      const unresolvedAlarm = new AlarmEvent(
        'alarm-3',
        'Ward C',
        'rule-789',
        'Active Alarm',
        AlarmPriority.WHITE,
        testData.activationTime,
        null,
        null,
        null,
      );
      expect(unresolvedAlarm.getResolutionTime()).toBeNull();
    });
  });

  describe('getUserId', () => {
    it('should return the user id when present', () => {
      expect(alarmEvent.getUserId()).toBe(5);
    });

    it('should return null when user id is not set', () => {
      const unassignedAlarm = new AlarmEvent(
        'alarm-4',
        'Ward D',
        'rule-101',
        'Unassigned Alarm',
        AlarmPriority.WHITE,
        testData.activationTime,
        null,
        null,
        null,
      );
      expect(unassignedAlarm.getUserId()).toBeNull();
    });

    it('should return the correct user id type', () => {
      expect(typeof alarmEvent.getUserId()).toBe('number');
    });
  });

  describe('getUserUsername', () => {
    it('should return the user username when present', () => {
      expect(alarmEvent.getUserUsername()).toBe('nurse_john');
    });

    it('should return null when user username is not set', () => {
      const unassignedAlarm = new AlarmEvent(
        'alarm-5',
        'Ward E',
        'rule-202',
        'Unassigned Alarm',
        AlarmPriority.WHITE,
        testData.activationTime,
        null,
        null,
        null,
      );
      expect(unassignedAlarm.getUserUsername()).toBeNull();
    });
  });

  describe('constructor', () => {
    it('should create an instance with all parameters', () => {
      expect(alarmEvent).toBeInstanceOf(AlarmEvent);
      expect(alarmEvent.getId()).toBe(testData.id);
      expect(alarmEvent.getPosition()).toBe(testData.position);
      expect(alarmEvent.getAlarmRuleId()).toBe(testData.alarmRuleId);
      expect(alarmEvent.getAlarmName()).toBe(testData.alarmName);
      expect(alarmEvent.getPriority()).toBe(testData.priority);
      expect(alarmEvent.getActivationTime()).toEqual(testData.activationTime);
      expect(alarmEvent.getResolutionTime()).toEqual(testData.resolutionTime);
      expect(alarmEvent.getUserId()).toBe(testData.userId);
      expect(alarmEvent.getUserUsername()).toBe(testData.userUsername);
    });

    it('should handle null values for optional fields', () => {
      const minimalAlarm = new AlarmEvent(
        'alarm-6',
        'Position X',
        'rule-303',
        'Test Alarm',
        AlarmPriority.WHITE,
        new Date(),
        null,
        null,
        null,
      );
      expect(minimalAlarm.getResolutionTime()).toBeNull();
      expect(minimalAlarm.getUserId()).toBeNull();
      expect(minimalAlarm.getUserUsername()).toBeNull();
    });
  });
});