import { AlarmRule } from 'src/alarms/domain/models/alarm-rule.model';
import { AlarmPriority } from 'src/alarms/domain/models/alarm-priority.enum';

describe('AlarmRule', () => {
  let alarmRule: AlarmRule;
  const testData = {
    id: 'rule-1',
    position: 'Ward A - Room 101',
    name: 'High Temperature Alert',
    thresholdOperator: '>',
    thresholdValue: '38.5',
    priority: AlarmPriority.WHITE,
    armingTime: new Date('2026-04-12T08:00:00Z'),
    dearmingTime: new Date('2026-04-12T20:00:00Z'),
    isArmed: true,
  };

  beforeEach(() => {
    alarmRule = new AlarmRule(
      testData.id,
      testData.position,
      testData.name,
      testData.thresholdOperator,
      testData.thresholdValue,
      testData.priority,
      testData.armingTime,
      testData.dearmingTime,
      testData.isArmed,
    );
  });

  it('should be defined', () => {
    expect(alarmRule).toBeDefined();
  });

  describe('getId', () => {
    it('should return the alarm rule id', () => {
      expect(alarmRule.getId()).toBe('rule-1');
    });

    it('should return the correct id type', () => {
      expect(typeof alarmRule.getId()).toBe('string');
    });
  });

  describe('getPosition', () => {
    it('should return the position', () => {
      expect(alarmRule.getPosition()).toBe('Ward A - Room 101');
    });

    it('should return a string', () => {
      expect(typeof alarmRule.getPosition()).toBe('string');
    });
  });

  describe('getName', () => {
    it('should return the alarm rule name', () => {
      expect(alarmRule.getName()).toBe('High Temperature Alert');
    });

    it('should return a string', () => {
      expect(typeof alarmRule.getName()).toBe('string');
    });
  });

  describe('getThresholdOperator', () => {
    it('should return the threshold operator', () => {
      expect(alarmRule.getThresholdOperator()).toBe('>');
    });

    it('should handle different operators', () => {
      const operators = ['>', '<', '>=', '<=', '==', '!='];
      operators.forEach((op) => {
        const rule = new AlarmRule(
          'rule-op',
          'position',
          'name',
          op,
          '100',
          AlarmPriority.WHITE,
          testData.armingTime,
          testData.dearmingTime,
          true,
        );
        expect(rule.getThresholdOperator()).toBe(op);
      });
    });
  });

  describe('getThresholdValue', () => {
    it('should return the threshold value', () => {
      expect(alarmRule.getThresholdValue()).toBe('38.5');
    });

    it('should return a string', () => {
      expect(typeof alarmRule.getThresholdValue()).toBe('string');
    });

    it('should handle numeric string values', () => {
      const rule = new AlarmRule(
        'rule-numeric',
        'position',
        'name',
        '>',
        '100.50',
        AlarmPriority.WHITE,
        testData.armingTime,
        testData.dearmingTime,
        false,
      );
      expect(rule.getThresholdValue()).toBe('100.50');
    });
  });

  describe('getPriority', () => {
    it('should return the priority', () => {
      expect(alarmRule.getPriority()).toBe(AlarmPriority.WHITE);
    });

    it('should handle different priority levels', () => {
      const priorities = [
        AlarmPriority.WHITE,
        AlarmPriority.GREEN,
        AlarmPriority.ORANGE,
        AlarmPriority.RED,
      ];
      priorities.forEach((priority) => {
        const rule = new AlarmRule(
          'rule-priority',
          'position',
          'name',
          '>',
          '100',
          priority,
          testData.armingTime,
          testData.dearmingTime,
          true,
        );
        expect(rule.getPriority()).toBe(priority);
      });
    });
  });

  describe('getArmingTime', () => {
    it('should return the arming time', () => {
      expect(alarmRule.getArmingTime()).toEqual(
        new Date('2026-04-12T08:00:00Z'),
      );
    });

    it('should return a Date object', () => {
      expect(alarmRule.getArmingTime()).toBeInstanceOf(Date);
    });
  });

  describe('getDearmingTime', () => {
    it('should return the dearming time', () => {
      expect(alarmRule.getDearmingTime()).toEqual(
        new Date('2026-04-12T20:00:00Z'),
      );
    });

    it('should return a Date object', () => {
      expect(alarmRule.getDearmingTime()).toBeInstanceOf(Date);
    });

    it('should have dearming time after arming time', () => {
      const armingTime = alarmRule.getArmingTime();
      const dearmingTime = alarmRule.getDearmingTime();
      expect(dearmingTime.getTime()).toBeGreaterThan(armingTime.getTime());
    });
  });

  describe('getIsArmed', () => {
    it('should return the armed status when true', () => {
      expect(alarmRule.getIsArmed()).toBe(true);
    });

    it('should return the armed status when false', () => {
      const disarmedRule = new AlarmRule(
        'rule-disarmed',
        'position',
        'name',
        '>',
        '100',
        AlarmPriority.WHITE,
        testData.armingTime,
        testData.dearmingTime,
        false,
      );
      expect(disarmedRule.getIsArmed()).toBe(false);
    });

    it('should return a boolean', () => {
      expect(typeof alarmRule.getIsArmed()).toBe('boolean');
    });
  });

  describe('constructor', () => {
    it('should create an instance with all parameters', () => {
      expect(alarmRule).toBeInstanceOf(AlarmRule);
      expect(alarmRule.getId()).toBe(testData.id);
      expect(alarmRule.getPosition()).toBe(testData.position);
      expect(alarmRule.getName()).toBe(testData.name);
      expect(alarmRule.getThresholdOperator()).toBe(testData.thresholdOperator);
      expect(alarmRule.getThresholdValue()).toBe(testData.thresholdValue);
      expect(alarmRule.getPriority()).toBe(testData.priority);
      expect(alarmRule.getArmingTime()).toEqual(testData.armingTime);
      expect(alarmRule.getDearmingTime()).toEqual(testData.dearmingTime);
      expect(alarmRule.getIsArmed()).toBe(testData.isArmed);
    });

    it('should handle different configurations', () => {
      const alternativeRule = new AlarmRule(
        'rule-alt',
        'Ward B',
        'Low Pressure',
        '<',
        '2.5',
        AlarmPriority.WHITE,
        new Date('2026-04-13T06:00:00Z'),
        new Date('2026-04-13T22:00:00Z'),
        false,
      );
      expect(alternativeRule.getId()).toBe('rule-alt');
      expect(alternativeRule.getName()).toBe('Low Pressure');
      expect(alternativeRule.getThresholdOperator()).toBe('<');
      expect(alternativeRule.getIsArmed()).toBe(false);
    });
  });

  describe('time validation scenarios', () => {
    it('should handle same day arming and dearming times', () => {
      const sameDay = new AlarmRule(
        'rule-same-day',
        'position',
        'name',
        '>',
        '100',
        AlarmPriority.WHITE,
        new Date('2026-04-12T09:00:00Z'),
        new Date('2026-04-12T17:00:00Z'),
        true,
      );
      expect(
        sameDay.getDearmingTime().getTime() >
          sameDay.getArmingTime().getTime(),
      ).toBe(true);
    });

    it('should handle different day arming and dearming times', () => {
      const differentDays = new AlarmRule(
        'rule-diff-days',
        'position',
        'name',
        '>',
        '100',
        AlarmPriority.WHITE,
        new Date('2026-04-12T20:00:00Z'),
        new Date('2026-04-13T08:00:00Z'),
        true,
      );
      expect(
        differentDays.getDearmingTime().getTime() >
          differentDays.getArmingTime().getTime(),
      ).toBe(true);
    });
  });
});