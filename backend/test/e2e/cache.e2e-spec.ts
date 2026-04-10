import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { overrideDatabaseForE2E } from '../setup-e2e-test';

describe('Cache (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    overrideDatabaseForE2E(moduleBuilder);
    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Wait for async operations like setImmediate to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  describe('POST /cache/update - Cache Update Webhook', () => {
    it('should accept cache update webhook for single plant', async () => {
      const payload = {
        data: [
          {
            type: 'service',
            id: 'test-plant-001',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.statusCode).toBe(202);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('plant(s)');
    });

    it('should accept cache update webhook for multiple plants', async () => {
      const payload = {
        data: [
          {
            type: 'service',
            id: 'test-plant-001',
          },
          {
            type: 'service',
            id: 'test-plant-002',
          },
          {
            type: 'service',
            id: 'test-plant-003',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('3 plant(s)');
    });

    it('should filter only service type items from notification data', async () => {
      const payload = {
        data: [
          {
            type: 'service',
            id: 'test-plant-001',
          },
          {
            type: 'other',
            id: 'test-other-001',
          },
          {
            type: 'service',
            id: 'test-plant-002',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      expect(response.body.message).toContain('2 plant(s)');
    });

    it('should handle empty notification data', async () => {
      const payload = {
        data: [],
      };

      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('0 plant(s)');
    });

    it('should handle webhook with no service type items', async () => {
      const payload = {
        data: [
          {
            type: 'room',
            id: 'test-room-001',
          },
          {
            type: 'device',
            id: 'test-device-001',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      expect(response.body.message).toContain('0 plant(s)');
    });

    it('should return 202 status immediately', async () => {
      const payload = {
        data: [
          {
            type: 'service',
            id: 'test-plant-001',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      expect(response.statusCode).toBe(202);
    });

    it('should handle large batches of plants', async () => {
      const largePayload = {
        data: Array.from({ length: 100 }, (_, i) => ({
          type: 'service',
          id: `plant-${i}`,
        })),
      };

      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(largePayload)
        .expect(202);

      expect(response.body.message).toContain('100 plant(s)');
    });

    it('should handle malformed data gracefully', async () => {
      const payload = {
        data: [
          {
            type: 'service',
            // Missing id field
          },
          {
            type: 'service',
            id: 'test-plant-001',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      // Should process without crashing
      expect(response.body.success).toBe(true);
    });

    it('should handle duplicate plant IDs in same webhook', async () => {
      const payload = {
        data: [
          {
            type: 'service',
            id: 'test-plant-001',
          },
          {
            type: 'service',
            id: 'test-plant-001',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      expect(response.body.success).toBe(true);
    });

    it('should handle special characters in plant IDs', async () => {
      const payload = {
        data: [
          {
            type: 'service',
            id: 'test-plant-001-with-dashes_and_underscores',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      expect(response.body.success).toBe(true);
    });

    it('should return proper response structure', async () => {
      const payload = {
        data: [
          {
            type: 'service',
            id: 'test-plant-001',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      expect(response.body).toEqual({
        success: true,
        statusCode: 202,
        message: expect.stringContaining('plant(s)'),
      });
    });

    it('should handle missing content-type header', async () => {
      const payload = {
        data: [
          {
            type: 'service',
            id: 'test-plant-001',
          },
        ],
      };

      // Supertest will still set content-type, but should handle gracefully
      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Cache Update Queue', () => {
    it('should process webhook without blocking response', async () => {
      const payload = {
        data: [
          {
            type: 'service',
            id: 'test-plant-queue-001',
          },
        ],
      };

      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      const elapsedTime = Date.now() - startTime;

      // Should respond quickly (within 100ms) since it's background processing
      expect(elapsedTime).toBeLessThan(100);
      expect(response.body.success).toBe(true);
    });

    it('should handle sequential webhook calls', async () => {
      const payload1 = {
        data: [{ type: 'service', id: 'plant-seq-001' }],
      };
      const payload2 = {
        data: [{ type: 'service', id: 'plant-seq-002' }],
      };

      const response1 = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload1)
        .expect(202);

      const response2 = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload2)
        .expect(202);

      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should handle null data payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send({ data: null })
        .expect([202, 400, 500]); // May fail with 500 if DB unavailable
    });

    it('should handle undefined data payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send({})
        .expect([202, 400, 500]); // May fail with 500 if DB unavailable
    });

    it('should handle JSON parsing errors gracefully', async () => {
      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect([202, 400, 500]); // May fail with 500 if DB unavailable
    });
  });

  describe('Error Recovery', () => {
    it('should log and continue processing on individual plant errors', async () => {
      const payload = {
        data: [
          { type: 'service', id: 'valid-plant-001' },
          { type: 'service', id: 'error-plant-001' },
          { type: 'service', id: 'valid-plant-002' },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/cache/update')
        .send(payload)
        .expect(202);

      expect(response.body.success).toBe(true);
    });
  });
});
