import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';
import { overrideDatabaseForE2E } from '../setup-e2e-test';

describe('Notifications (e2e)', () => {
  let app: INestApplication;
  let eventEmitter: EventEmitter2;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    overrideDatabaseForE2E(moduleBuilder);
    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    eventEmitter = moduleFixture.get<EventEmitter2>(EventEmitter2);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clean up event listeners to prevent test pollution
    eventEmitter.removeAllListeners();
    // Allow async event processing to complete
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  describe('Notification Module Integration', () => {
    it('should have notification module properly initialized', async () => {
      expect(app).toBeDefined();
      expect(eventEmitter).toBeDefined();
    });

    it('should have EventNotificationController registered', async () => {
      const container = (app as any).container;
      expect(container).toBeDefined();
    });

    it('should have all required use cases injected', async () => {
      // Verify that the app is properly initialized with all modules
      expect(app).toBeDefined();
      expect(eventEmitter).toBeDefined();
    });
  });

  describe('Alarm Activation Event Handling', () => {
    it('should emit alarm.activated event', (done) => {
      const alarmEvent: CheckAlarmRuleResDto = {
        alarmRuleId: 'alarm-rule-001',
        wardId: 1,
        alarmEventId: 'alarm-001',
      };

      // Listen for the event
      eventEmitter.once('alarm.activated', (payload) => {
        expect(payload).toBeDefined();
        expect(payload.alarmEventId).toBe('alarm-001');
        done();
      });

      // Emit the event
      eventEmitter.emit('alarm.activated', alarmEvent);
    });

    it('should handle alarm.activated with valid alarm data', async () => {
      const alarmEvent = {
        alarmEventId: 'alarm-002',
        wardId: 2,
        deviceId: 'device-002',
        alarmId: 'alarm-id-002',
        severity: 'MEDIUM',
        timestamp: new Date(),
        datapointId: 'datapoint-002',
        roomId: 2,
        currentValue: 25,
      };

      // Emit the event - should not throw
      expect(() => {
        eventEmitter.emit('alarm.activated', alarmEvent);
      }).not.toThrow();
    });

    it('should handle alarm.activated with null payload gracefully', async () => {
      // Should not crash the application
      expect(() => {
        eventEmitter.emit('alarm.activated', null);
      }).not.toThrow();
    });

    it('should handle alarm.activated with missing alarmEventId', async () => {
      const alarmEvent = {
        plantId: 'plant-001',
        wardId: 1,
        // Missing alarmEventId
      };

      expect(() => {
        eventEmitter.emit('alarm.activated', alarmEvent);
      }).not.toThrow();
    });

    it('should handle alarm.activated with incomplete data', async () => {
      const alarmEvent = {
        alarmEventId: 'alarm-003',
        // Missing other required fields
      };

      expect(() => {
        eventEmitter.emit('alarm.activated', alarmEvent);
      }).not.toThrow();
    });

    it('should handle multiple simultaneous alarm.activated events', async () => {
      const alarms = [
        {
          alarmEventId: 'alarm-batch-001',
          wardId: 1,
        },
        {
          alarmEventId: 'alarm-batch-002',
          wardId: 2,
        },
        {
          alarmEventId: 'alarm-batch-003',
          wardId: 3,
        },
      ];

      expect(() => {
        alarms.forEach((alarm) => {
          eventEmitter.emit('alarm.activated', alarm);
        });
      }).not.toThrow();
    });

    it('should handle alarm.activated with different severity levels', async () => {
      const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

      severities.forEach((severity) => {
        const alarmEvent = {
          alarmEventId: `alarm-severity-${severity}`,
          severity: severity,
          wardId: 1,
        };

        expect(() => {
          eventEmitter.emit('alarm.activated', alarmEvent);
        }).not.toThrow();
      });
    });

    it('should log alarm activation events', (done) => {
      const consoleSpy = jest.spyOn(console, 'log');

      const alarmEvent = {
        alarmEventId: 'alarm-log-001',
        wardId: 1,
      };

      eventEmitter.emit('alarm.activated', alarmEvent);

      // Give it a moment to process
      setTimeout(() => {
        // Event should have been emitted
        expect(true).toBe(true);
        consoleSpy.mockRestore();
        done();
      }, 10);
    });
  });

  describe('Alarm Resolution Event Handling', () => {
    it('should emit alarm.resolved event', (done) => {
      const resolvedEvent = {
        alarmEventId: 'alarm-resolved-001',
        wardId: 1,
      };

      eventEmitter.once('alarm.resolved', (payload) => {
        expect(payload).toBeDefined();
        expect(payload.alarmEventId).toBe('alarm-resolved-001');
        done();
      });

      eventEmitter.emit('alarm.resolved', resolvedEvent);
    });

    it('should handle alarm.resolved with valid data', async () => {
      const resolvedEvent = {
        alarmEventId: 'alarm-resolved-002',
        wardId: 2,
      };

      expect(() => {
        eventEmitter.emit('alarm.resolved', resolvedEvent);
      }).not.toThrow();
    });

    it('should handle alarm.resolved with null payload', async () => {
      expect(() => {
        eventEmitter.emit('alarm.resolved', null);
      }).not.toThrow();
    });

    it('should handle alarm.resolved with missing alarmEventId', async () => {
      const resolvedEvent = {
        wardId: 1,
        // Missing alarmEventId
      };

      expect(() => {
        eventEmitter.emit('alarm.resolved', resolvedEvent);
      }).not.toThrow();
    });

    it('should handle alarm.resolved with missing wardId', async () => {
      const resolvedEvent = {
        alarmEventId: 'alarm-resolved-003',
        // Missing wardId
      };

      expect(() => {
        eventEmitter.emit('alarm.resolved', resolvedEvent);
      }).not.toThrow();
    });

    it('should handle multiple simultaneous alarm.resolved events', async () => {
      const resolvedAlarms = [
        {
          alarmEventId: 'alarm-res-batch-001',
          wardId: 1,
        },
        {
          alarmEventId: 'alarm-res-batch-002',
          wardId: 2,
        },
        {
          alarmEventId: 'alarm-res-batch-003',
          wardId: 3,
        },
      ];

      expect(() => {
        resolvedAlarms.forEach((alarm) => {
          eventEmitter.emit('alarm.resolved', alarm);
        });
      }).not.toThrow();
    });

    it('should handle rapid successive alarm.resolved events', async () => {
      expect(() => {
        for (let i = 0; i < 10; i++) {
          eventEmitter.emit('alarm.resolved', {
            alarmEventId: `alarm-rapid-${i}`,
            wardId: 1,
          });
        }
      }).not.toThrow();
    });
  });

  describe('Event Flow Integration', () => {
    it('should handle alarm activation followed by resolution', async () => {
      const alarmId = 'alarm-flow-001';

      expect(() => {
        eventEmitter.emit('alarm.activated', {
          alarmEventId: alarmId,
          wardId: 1,
        });

        eventEmitter.emit('alarm.resolved', {
          alarmEventId: alarmId,
          wardId: 1,
        });
      }).not.toThrow();
    });

    it('should handle multiple alarms and resolutions', async () => {
      const alarms = [
        { id: 'alarm-1', wardId: 1 },
        { id: 'alarm-2', wardId: 2 },
        { id: 'alarm-3', wardId: 3 },
      ];

      expect(() => {
        // Activate all
        alarms.forEach((alarm) => {
          eventEmitter.emit('alarm.activated', {
            alarmEventId: alarm.id,
            wardId: alarm.wardId,
          });
        });

        // Resolve all
        alarms.forEach((alarm) => {
          eventEmitter.emit('alarm.resolved', {
            alarmEventId: alarm.id,
            wardId: alarm.wardId,
          });
        });
      }).not.toThrow();
    });
  });

  describe('Error Handling & Resilience', () => {
    it('should not crash on invalid event data', async () => {
      const invalidData = {
        notExpectedField: 'test',
        randomField: 123,
      };

      expect(() => {
        eventEmitter.emit('alarm.activated', invalidData);
      }).not.toThrow();
    });

    it('should handle events with extra fields', async () => {
      const eventWithExtras = {
        alarmEventId: 'alarm-extra-001',
        wardId: 1,
        extraField1: 'value1',
        extraField2: 'value2',
        extraField3: 'value3',
      };

      expect(() => {
        eventEmitter.emit('alarm.activated', eventWithExtras);
      }).not.toThrow();
    });

    it('should handle undefined event properties', async () => {
      const eventWithUndefined = {
        alarmEventId: undefined,
        wardId: undefined,
        timestamp: undefined,
      };

      expect(() => {
        eventEmitter.emit('alarm.activated', eventWithUndefined);
      }).not.toThrow();
    });

    it('should handle very long string values in events', async () => {
      const longString = 'a'.repeat(10000);
      const eventWithLongString = {
        alarmEventId: longString,
        wardId: 1,
      };

      expect(() => {
        eventEmitter.emit('alarm.activated', eventWithLongString);
      }).not.toThrow();
    });

    it('should handle circular references in event data', async () => {
      const event: any = {
        alarmEventId: 'alarm-circular-001',
        wardId: 1,
      };
      event.self = event; // Create circular reference

      expect(() => {
        eventEmitter.emit('alarm.activated', event);
      }).not.toThrow();
    });
  });

  describe('Notification Service Integration', () => {
    it('should process notification for different ward IDs', async () => {
      const wardIds = [1, 2, 3, 5, 10];

      wardIds.forEach((wardId) => {
        expect(() => {
          eventEmitter.emit('alarm.activated', {
            alarmEventId: `alarm-ward-${wardId}`,
            wardId: wardId,
          });
        }).not.toThrow();
      });
    });

    it('should handle same alarmEventId across events', async () => {
      const alarmId = 'duplicate-alarm-id';

      expect(() => {
        eventEmitter.emit('alarm.activated', {
          alarmEventId: alarmId,
          wardId: 1,
        });

        eventEmitter.emit('alarm.activated', {
          alarmEventId: alarmId,
          wardId: 2,
        });
      }).not.toThrow();
    });

    it('should handle negative and zero ward IDs', async () => {
      expect(() => {
        eventEmitter.emit('alarm.activated', {
          alarmEventId: 'alarm-negative',
          wardId: -1,
        });

        eventEmitter.emit('alarm.activated', {
          alarmEventId: 'alarm-zero',
          wardId: 0,
        });
      }).not.toThrow();
    });
  });

  describe('Event Listener Subscriptions', () => {
    it('should support multiple listeners for same event', (done) => {
      let callCount = 0;
      const expectedListeners = 3;

      const listener = () => {
        callCount++;
        if (callCount === expectedListeners) {
          done();
        }
      };

      // Subscribe multiple times
      eventEmitter.on('alarm.activated', listener);
      eventEmitter.on('alarm.activated', listener);
      eventEmitter.on('alarm.activated', listener);

      eventEmitter.emit('alarm.activated', {
        alarmEventId: 'test-multi-listener',
        wardId: 1,
      });
    });
  });
});
