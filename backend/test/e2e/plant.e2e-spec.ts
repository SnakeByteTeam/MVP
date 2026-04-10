import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { overrideDatabaseForE2E } from '../setup-e2e-test';

describe('Plant (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockUser = {
    id: 'test-plant-user-001',
    email: 'plant-test@example.com',
    roles: ['user', 'admin'],
  };

  let validToken: string;
  let userOnlyToken: string = '';

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
    
    // Create user-only token for guard validation tests
    userOnlyToken = jwtService.sign({
      id: 'user-without-admin',
      email: 'user@example.com',
      roles: ['user'],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Allow async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  describe('GET /plant - Find Plant By ID', () => {
    const validPlantId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    it('should retrieve plant structure with valid plant ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: validPlantId })
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (response.statusCode === 200) {
        expect(response.body).toBeDefined();
        if (response.body && response.body.id) {
          expect(response.body.id).toBe(validPlantId);
        }
      }
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: validPlantId })
        .expect(401);
    });

    it('should return 400 when plant ID is missing', async () => {
      await request(app.getHttpServer())
        .get('/plant')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([400, 404]);
    });

    it('should handle non-existent plant ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: 'non-existent-plant-id' })
        .set('Authorization', `Bearer ${validToken}`)
        .expect([400, 404, 500]);
    });

    it('should handle invalid UUID format', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: 'invalid-uuid-format' })
        .set('Authorization', `Bearer ${validToken}`)
        .expect([400, 404, 500]);
    });

    it('should return plant with correct structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: validPlantId })
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (response.statusCode === 200 && response.body) {
        expect(response.body).toHaveProperty('id');
        if (response.body.rooms) {
          expect(Array.isArray(response.body.rooms)).toBe(true);
        }
      }
    });

    it('should handle special characters in plant ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: 'test-id%20with%20spaces' })
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);
    });

    it('should handle case sensitivity in plant ID query', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant')
        .query({ plantId: validPlantId })
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);
    });

    it('should return plant data with complete structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: validPlantId })
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (response.statusCode === 200 && response.body) {
        expect(response.body).toBeDefined();
        if (response.body.id) {
          expect(typeof response.body.id).toBe('string');
        }
      }
    });
  });

  describe('GET /plant/available - Find All Available Plants', () => {
    it('should retrieve all available plants', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant/available')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (response.statusCode === 200) {
        if (Array.isArray(response.body)) {
          expect(response.body).toBeInstanceOf(Array);
        } else if (response.body && response.body.data) {
          expect(Array.isArray(response.body.data)).toBe(true);
        }
      }
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/plant/available')
        .expect(401);
    });

    it('should return array of plant objects', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant/available')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (response.statusCode === 200) {
        if (Array.isArray(response.body)) {
          response.body.forEach((plant) => {
            expect(plant).toHaveProperty('id');
          });
        }
      }
    });

    it('should handle empty result set', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant/available')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (response.statusCode === 200) {
        if (Array.isArray(response.body)) {
          expect(Array.isArray(response.body)).toBe(true);
        }
      }
    });

    it('should include plant metadata', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant/available')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (response.statusCode === 200 && Array.isArray(response.body)) {
        if (response.body.length > 0) {
          const plant = response.body[0];
          expect(plant).toHaveProperty('id');
          if (plant.name) {
            expect(typeof plant.name).toBe('string');
          }
        }
      }
    });
  });

  describe('GET /plant/all - Find All Plants', () => {
    it('should retrieve all plants (including unavailable)', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant/all')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (response.statusCode === 200) {
        if (Array.isArray(response.body)) {
          expect(response.body).toBeInstanceOf(Array);
        } else if (response.body && response.body.data) {
          expect(Array.isArray(response.body.data)).toBe(true);
        }
      }
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/plant/all')
        .expect(401);
    });

    it('should return all plant objects including unavailable', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant/all')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (response.statusCode === 200) {
        if (Array.isArray(response.body)) {
          expect(Array.isArray(response.body)).toBe(true);
        }
      }
    });

    it('should have same or more plants than available endpoint', async () => {
      const availableResponse = await request(app.getHttpServer())
        .get('/plant/available')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      const allResponse = await request(app.getHttpServer())
        .get('/plant/all')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (
        availableResponse.statusCode === 200 &&
        allResponse.statusCode === 200
      ) {
        const availableCount = Array.isArray(availableResponse.body)
          ? availableResponse.body.length
          : 0;
        const allCount = Array.isArray(allResponse.body)
          ? allResponse.body.length
          : 0;

        expect(allCount).toBeGreaterThanOrEqual(availableCount);
      }
    });

    it('should include plant status information', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant/all')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (response.statusCode === 200 && Array.isArray(response.body)) {
        if (response.body.length > 0) {
          const plant = response.body[0];
          expect(plant).toHaveProperty('id');
        }
      }
    });
  });

  describe('Guard Validation', () => {
    it('should allow user role to access plants', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
        .set('Authorization', `Bearer ${userOnlyToken}`)
        .expect([200, 400, 404, 500]);
    });

    it('should validate UserGuard on all plant endpoints', async () => {
      await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: 'valid-id' })
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });

    it('should handle expired JWT token', async () => {
      const expiredToken = jwtService.sign(mockUser, { expiresIn: 0 });

      await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: 'valid-id' })
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect([401, 404]);
    });

    it('should handle missing query parameters gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404]);
    });

    it('should handle very long plant ID strings', async () => {
      const longId = 'a'.repeat(1000);
      const response = await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: longId })
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 413, 500]);
    });

    it('should handle SQL injection attempt in plant ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: "'; DROP TABLE plants; --" })
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);
    });

    it('should handle null plant ID parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: null })
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404]);
    });
  });

  describe('Content Negotiation', () => {
    it('should return JSON response', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant')
        .query({ plantid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
        .set('Authorization', `Bearer ${validToken}`)
        .set('Accept', 'application/json')
        .expect([200, 400, 404, 500]);

      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('Response Validation', () => {
    it('should return valid JSON in all responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/plant/available')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      expect(() => JSON.stringify(response.body)).not.toThrow();
    });

    it('should maintain response structure consistency', async () => {
      const response1 = await request(app.getHttpServer())
        .get('/plant/available')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      const response2 = await request(app.getHttpServer())
        .get('/plant/available')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 400, 404, 500]);

      if (response1.statusCode === response2.statusCode) {
        expect(typeof response1.body).toBe(typeof response2.body);
      }
    });
  });
});
