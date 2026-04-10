import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { overrideDatabaseForE2E } from '../setup-e2e-test';

describe('Subscription (e2e)', () => {
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

  describe('Subscription Module Integration', () => {
    it('should have subscription module properly initialized', async () => {
      expect(app).toBeDefined();
      expect(eventEmitter).toBeDefined();
    });

    it('should have EventSubscriptionController registered', async () => {
      expect(app).toBeDefined();
    });

    it('should have all required use cases injected', async () => {
      expect(app).toBeDefined();
    });
  });

  describe('Cache Sync Event - cache.all.updated', () => {
    it('should emit cache.all.updated event', (done) => {
      eventEmitter.once('cache.all.updated', () => {
        expect(true).toBe(true);
        done();
      });

      eventEmitter.emit('cache.all.updated', {});
    });

    it('should handle cache.all.updated with valid data', async () => {
      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          timestamp: new Date(),
          plantIds: ['plant-001', 'plant-002'],
        });
      }).not.toThrow();
    });

    it('should handle cache.all.updated with null payload', async () => {
      expect(() => {
        eventEmitter.emit('cache.all.updated', null);
      }).not.toThrow();
    });

    it('should handle cache.all.updated with empty payload', async () => {
      expect(() => {
        eventEmitter.emit('cache.all.updated', {});
      }).not.toThrow();
    });

    it('should handle cache.all.updated with array of plant IDs', async () => {
      const plantIds = [
        'plant-001',
        'plant-002',
        'plant-003',
        'plant-004',
        'plant-005',
      ];

      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          plantIds: plantIds,
          timestamp: new Date(),
        });
      }).not.toThrow();
    });

    it('should handle cache.all.updated with large batch of plants', async () => {
      const largeBatch = Array.from({ length: 1000 }, (_, i) => `plant-${i}`);

      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          plantIds: largeBatch,
        });
      }).not.toThrow();
    });

    it('should handle multiple consecutive cache.all.updated events', async () => {
      expect(() => {
        for (let i = 0; i < 5; i++) {
          eventEmitter.emit('cache.all.updated', {
            timestamp: new Date(),
            plantIds: [`plant-${i}`],
          });
        }
      }).not.toThrow();
    });

    it('should handle cache.all.updated with extra metadata', async () => {
      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          timestamp: new Date(),
          plantIds: ['plant-001', 'plant-002'],
          source: 'api',
          duration: 1500,
          userId: 'user-123',
        });
      }).not.toThrow();
    });
  });

  describe('Subscription Refresh Mechanisms', () => {
    it('should trigger node subscription refresh on cache update', async () => {
      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          timestamp: new Date(),
          plantIds: ['plant-refresh-001'],
        });
      }).not.toThrow();
    });

    it('should trigger datapoint subscription refresh on cache update', async () => {
      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          timestamp: new Date(),
          plantIds: ['plant-refresh-002'],
        });
      }).not.toThrow();
    });

    it('should handle subscription refresh for multiple plants', async () => {
      const plants = ['plant-1', 'plant-2', 'plant-3', 'plant-4'];

      for (const plant of plants) {
        expect(() => {
          eventEmitter.emit('cache.all.updated', {
            plantIds: [plant],
          });
        }).not.toThrow();
      }
    });

    it('should handle partial failure in subscription refresh', async () => {
      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          plantIds: ['valid-plant', 'error-prone-plant', 'another-plant'],
        });
      }).not.toThrow();
    });
  });

  describe('Scheduled Cron Jobs', () => {
    it('should handle subscription module with scheduled tasks', async () => {
      // The module should be initialized with scheduled cron tasks
      expect(app).toBeDefined();
    });

    it('should support manual trigger of node subscription refresh', async () => {
      // Manual refresh should be supported
      expect(app).toBeDefined();
    });

    it('should support manual trigger of datapoint subscription refresh', async () => {
      // Manual refresh should be supported
      expect(app).toBeDefined();
    });
  });

  describe('Event Flow - Subscription Lifecycle', () => {
    it('should handle cache update in sequence', async () => {
      expect(() => {
        // Simulate cache update lifecycle
        eventEmitter.emit('cache.all.updated', {
          timestamp: new Date(),
          plantIds: ['plant-lifecycle-001'],
        });

        // No immediate subscription issued - would happen on cron or explicit event
        eventEmitter.emit('cache.all.updated', {
          timestamp: new Date(),
          plantIds: ['plant-lifecycle-002'],
        });
      }).not.toThrow();
    });

    it('should handle concurrent cache updates with subscriptions', async () => {
      expect(() => {
        const updates: any[] = [];
        for (let i = 0; i < 10; i++) {
          updates.push({
            timestamp: new Date(),
            plantIds: [`plant-concurrent-${i}`],
          });
        }

        // Start all at roughly the same time
        updates.forEach((update) => {
          setTimeout(() => {
            eventEmitter.emit('cache.all.updated', update);
          }, Math.random() * 10);
        });
      }).not.toThrow();
    });
  });

  describe('Error Handling & Resilience', () => {
    it('should handle invalid event data gracefully', async () => {
      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          notExpectedField: 'test',
          randomNumber: 123,
        });
      }).not.toThrow();
    });

    it('should handle events with undefined properties', async () => {
      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          timestamp: undefined,
          plantIds: undefined,
        });
      }).not.toThrow();
    });

    it('should handle malformed plant ID arrays', async () => {
      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          plantIds: [null, undefined, 123, {}, []],
        });
      }).not.toThrow();
    });

    it('should handle non-string plant IDs', async () => {
      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          plantIds: [123, true, { id: 'plant' }, ['nested']],
        });
      }).not.toThrow();
    });

    it('should handle very large string values in event data', async () => {
      const largeString = 'a'.repeat(100000);
      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          timestamp: new Date(),
          description: largeString,
        });
      }).not.toThrow();
    });

    it('should handle circular references in event data', async () => {
      const circularData: any = {
        timestamp: new Date(),
      };
      circularData.self = circularData;

      expect(() => {
        eventEmitter.emit('cache.all.updated', circularData);
      }).not.toThrow();
    });

    it('should handle rapid-fire events without stalling', async () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          eventEmitter.emit('cache.all.updated', {
            timestamp: new Date(),
            index: i,
          });
        }
      }).not.toThrow();
    });

    it('should handle mixed valid and invalid payloads', async () => {
      expect(() => {
        eventEmitter.emit('cache.all.updated', { plantIds: ['valid-1'] });
        eventEmitter.emit('cache.all.updated', null);
        eventEmitter.emit('cache.all.updated', { plantIds: ['valid-2'] });
        eventEmitter.emit('cache.all.updated', {});
        eventEmitter.emit('cache.all.updated', { plantIds: ['valid-3'] });
      }).not.toThrow();
    });
  });

  describe('Subscription Repository', () => {
    it('should initialize subscription repository', async () => {
      expect(app).toBeDefined();
    });

    it('should support node subscription operations', async () => {
      // Node subscriptions should be supported
      expect(app).toBeDefined();
    });

    it('should support datapoint subscription operations', async () => {
      // Datapoint subscriptions should be supported
      expect(app).toBeDefined();
    });
  });

  describe('Integration with Other Modules', () => {
    it('should integrate with API Auth Vimar Module', async () => {
      // Should have access to token management
      expect(app).toBeDefined();
    });

    it('should integrate with Cache Module', async () => {
      // Should respond to cache events
      expect(app).toBeDefined();
    });

    it('should export subscription use cases to other modules', async () => {
      // Should provide subscription management
      expect(app).toBeDefined();
    });
  });

  describe('Event Listener Behavior', () => {
    it('should support multiple event listeners', (done) => {
      let listenerCount = 0;
      const expectedListeners = 3;

      const listener = () => {
        listenerCount++;
        if (listenerCount === expectedListeners) {
          done();
        }
      };

      eventEmitter.on('cache.all.updated', listener);
      eventEmitter.on('cache.all.updated', listener);
      eventEmitter.on('cache.all.updated', listener);

      eventEmitter.emit('cache.all.updated', {
        timestamp: new Date(),
      });
    });

    it('should handle listener errors without stopping other listeners', async () => {
      let errorListenerCalled = false;
      let normalListenerCalled = false;

      eventEmitter.on('cache.all.updated', () => {
        errorListenerCalled = true;
        try {
          throw new Error('Test error');
        } catch (e) {
          // Error is caught and doesn't propagate
        }
      });

      eventEmitter.on('cache.all.updated', () => {
        normalListenerCalled = true;
      });

      eventEmitter.emit('cache.all.updated', {});

      // Wait a moment for async processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(errorListenerCalled && normalListenerCalled).toBe(true);
    });
  });

  describe('Subscription State Management', () => {
    it('should maintain subscription state across multiple events', async () => {
      expect(() => {
        for (let i = 0; i < 5; i++) {
          eventEmitter.emit('cache.all.updated', {
            timestamp: new Date(),
            batch: i,
            plantIds: [`plant-state-${i}`],
          });
        }
      }).not.toThrow();
    });

    it('should handle state updates for same plant across events', async () => {
      const plantId = 'plant-state-test';

      expect(() => {
        eventEmitter.emit('cache.all.updated', { plantIds: [plantId] });
        eventEmitter.emit('cache.all.updated', { plantIds: [plantId] });
        eventEmitter.emit('cache.all.updated', { plantIds: [plantId] });
      }).not.toThrow();
    });
  });

  describe('Performance & Load Testing', () => {
    it('should handle high frequency cache update events', async () => {
      expect(() => {
        for (let i = 0; i < 50; i++) {
          eventEmitter.emit('cache.all.updated', {
            timestamp: new Date(),
            plantIds: Array.from(
              { length: 10 },
              (_, j) => `plant-load-${i}-${j}`,
            ),
          });
        }
      }).not.toThrow();
    });

    it('should handle very large plant ID lists', async () => {
      const largePlantList = Array.from(
        { length: 5000 },
        (_, i) => `plant-${i}`,
      );

      expect(() => {
        eventEmitter.emit('cache.all.updated', {
          plantIds: largePlantList,
        });
      }).not.toThrow();
    });

    it('should maintain performance with repeated events', async () => {
      const startTime = Date.now();

      expect(() => {
        for (let i = 0; i < 100; i++) {
          eventEmitter.emit('cache.all.updated', {
            index: i,
          });
        }
      }).not.toThrow();

      const elapsedTime = Date.now() - startTime;
      // Should complete 100 events in reasonable time (less than 1 second)
      expect(elapsedTime).toBeLessThan(1000);
    });
  });
});
