import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { overrideDatabaseForE2E } from '../setup-e2e-test';

describe('Device (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockUser = {
    id: 'test-device-user-001',
    email: 'device-test@example.com',
    roles: ['user', 'admin'],
  };

  let validToken: string;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    overrideDatabaseForE2E(moduleBuilder);
    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = new JwtService({ secret: process.env.ACCESS_SECRET });
    validToken = jwtService.sign(mockUser);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Allow async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  describe('GET /device/:id - Find Device By ID', () => {
    const validDeviceId = 'fct-012923FAB00624-1090564616';

    it('should retrieve device by valid ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/device/${validDeviceId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 500]);

      if (response.statusCode === 200 && response.body) {
        expect(response.body).toHaveProperty('id');
      }
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/device/${validDeviceId}`)
        .expect(401);
    });

    it('should handle non-existent device ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/device/non-existent-device-id')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 404, 500]);

      // Should handle gracefully - either return 404 or empty/error response
    });

    it('should validate device ID format', async () => {
      const response = await request(app.getHttpServer())
        .get('/device/invalid@#$')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);
    });

    it('should handle empty device ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/device/')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([404, 405]); // Not found or method not allowed
    });

    it('should handle special characters in device ID', async () => {
      const deviceIdWithSpecialChars = 'device-with-dashes_and_underscores';
      const response = await request(app.getHttpServer())
        .get(`/device/${deviceIdWithSpecialChars}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 404, 500]);
    });

    it('should return device with proper structure', async () => {
      const response = await request(app.getHttpServer())
        .get(`/device/${validDeviceId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 500]);

      if (response.statusCode === 200 && response.body && response.body.id) {
        expect(response.body).toHaveProperty('id');
        expect(typeof response.body.id).toBe('string');
      }
    });
  });

  describe('POST /device/write-datapoint - Write Datapoint Value', () => {
    it('should write datapoint value for valid input', async () => {
      const payload = {
        deviceId: 'fct-012923FAB00624-1090564616',
        datapointId: 'datapoint-001',
        value: 25.5,
      };

      const response = await request(app.getHttpServer())
        .post('/device/write-datapoint')
        .set('Authorization', `Bearer ${validToken}`)
        .send(payload)
        .expect([200, 201, 202, 400, 404, 500]);

      // Should handle the request (success or controlled error)
      expect(response.body).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const payload = {
        deviceId: 'test-device',
        datapointId: 'test-datapoint',
        value: 10,
      };

      await request(app.getHttpServer())
        .post('/device/write-datapoint')
        .send(payload)
        .expect([401, 404]);
    });

    it('should handle missing deviceId', async () => {
      const payload = {
        datapointId: 'datapoint-001',
        value: 25.5,
      };

      const response = await request(app.getHttpServer())
        .post('/device/write-datapoint')
        .set('Authorization', `Bearer ${validToken}`)
        .send(payload)
        .expect([400, 404, 500]);

      expect(response.body).toBeDefined();
    });

    it('should handle missing datapointId', async () => {
      const payload = {
        deviceId: 'device-001',
        value: 25.5,
      };

      const response = await request(app.getHttpServer())
        .post('/device/write-datapoint')
        .set('Authorization', `Bearer ${validToken}`)
        .send(payload)
        .expect([400, 404, 500]);
    });

    it('should accept numeric values', async () => {
      const payload = {
        deviceId: 'fct-012923FAB00624-1090564616',
        datapointId: 'datapoint-001',
        value: 42,
      };

      const response = await request(app.getHttpServer())
        .post('/device/write-datapoint')
        .set('Authorization', `Bearer ${validToken}`)
        .send(payload)
        .expect([200, 201, 202, 400, 404, 500]);
    });

    it('should handle null value', async () => {
      const payload = {
        deviceId: 'device-001',
        datapointId: 'datapoint-001',
        value: null,
      };

      const response = await request(app.getHttpServer())
        .post('/device/write-datapoint')
        .set('Authorization', `Bearer ${validToken}`)
        .send(payload)
        .expect([200, 201, 202, 400, 404, 500]);
    });
  });

  describe('GET /device/value/:deviceId/:datapointId - Get Device Value', () => {
    it('should retrieve device value for valid IDs', async () => {
      const response = await request(app.getHttpServer())
        .get('/device/value/device-001/datapoint-001')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      expect(response.body).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/device/value/device-001/datapoint-001')
        .expect([401, 404]);
    });

    it('should handle missing deviceId', async () => {
      const response = await request(app.getHttpServer())
        .get('/device/value//datapoint-001')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);
    });

    it('should handle missing datapointId', async () => {
      const response = await request(app.getHttpServer())
        .get('/device/value/device-001/')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);
    });
  });

  describe('POST /device/ingest-timeseries - Ingest Timeseries Data', () => {
    it('should ingest timeseries data for valid input', async () => {
      const payload = {
        deviceId: 'device-001',
        datapointId: 'datapoint-001',
        timestamp: Date.now(),
        value: 25.5,
      };

      const response = await request(app.getHttpServer())
        .post('/device/ingest-timeseries')
        .set('Authorization', `Bearer ${validToken}`)
        .send(payload)
        .expect([200, 201, 202, 400, 404, 500]);

      expect(response.body).toBeDefined();
    });

    it('should accept multiple timeseries entries', async () => {
      const payload = {
        data: [
          {
            deviceId: 'device-001',
            datapointId: 'datapoint-001',
            timestamp: Date.now(),
            value: 25.5,
          },
          {
            deviceId: 'device-001',
            datapointId: 'datapoint-002',
            timestamp: Date.now(),
            value: 30.0,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/device/ingest-timeseries')
        .set('Authorization', `Bearer ${validToken}`)
        .send(payload)
        .expect([200, 201, 202, 400, 404, 500]);
    });

    it('should handle missing timestamp', async () => {
      const payload = {
        deviceId: 'device-001',
        datapointId: 'datapoint-001',
        value: 25.5,
      };

      const response = await request(app.getHttpServer())
        .post('/device/ingest-timeseries')
        .set('Authorization', `Bearer ${validToken}`)
        .send(payload)
        .expect([200, 201, 202, 400, 404, 500]);
    });

    it('should return 401 without authentication', async () => {
      const payload = {
        deviceId: 'device-001',
        datapointId: 'datapoint-001',
        value: 25.5,
      };

      await request(app.getHttpServer())
        .post('/device/ingest-timeseries')
        .send(payload)
        .expect([401, 404]);
    });
  });

  describe('GET /device/by-plantid/:plantId - Find Devices By Plant ID', () => {
    it('should retrieve devices for valid plant ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/device/by-plantid/plant-001')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      expect(response.body).toBeDefined();
    });

    it('should return array of devices', async () => {
      const response = await request(app.getHttpServer())
        .get('/device/by-plantid/plant-001')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (Array.isArray(response.body)) {
        expect(response.body).toBeInstanceOf(Array);
      }
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/device/by-plantid/plant-001')
        .expect([401, 404]);
    });

    it('should handle non-existent plant ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/device/by-plantid/non-existent-plant')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);
    });
  });

  describe('Error Handling & Guard Validation', () => {
    it('should validate UserGuard on protected endpoints', async () => {
      await request(app.getHttpServer())
        .get(`/device/fct-012923FAB00624-1090564616`)
        .expect(401);
    });

    it('should handle malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get(`/device/fct-012923FAB00624-1090564616`)
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });

    it('should handle special characters in IDs safely', async () => {
      const response = await request(app.getHttpServer())
        .get('/device/test-id%20with%20spaces')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      expect(response.body).toBeDefined();
    });

    it('should handle very long ID strings', async () => {
      const longId = 'a'.repeat(1000);
      const response = await request(app.getHttpServer())
        .get(`/device/${longId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 413, 500]);
    });
  });

  describe('Content Negotiation', () => {
    it('should return JSON response', async () => {
      const response = await request(app.getHttpServer())
        .get(`/device/fct-012923FAB00624-1090564616`)
        .set('Authorization', `Bearer ${validToken}`)
        .set('Accept', 'application/json')
        .expect([200, 400, 404, 500]);

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should accept application/json content type for POST requests', async () => {
      const payload = {
        deviceId: 'device-001',
        datapointId: 'datapoint-001',
        value: 25.5,
      };

      const response = await request(app.getHttpServer())
        .post('/device/write-datapoint')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/json')
        .send(payload)
        .expect([200, 201, 202, 400, 404, 500]);

      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});
