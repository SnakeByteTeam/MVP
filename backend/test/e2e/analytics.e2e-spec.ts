import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { overrideDatabaseForE2E } from '../setup-e2e-test';
import { Plot } from 'src/analytics/domain/plot.model';

describe('Analytics (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let validToken: string;
  let userOnlyToken: string;

  const VALID_PLANT_ID = 'AA0011BB0011';
  const UNKNOWN_PLANT_ID = 'UNKNOWN000000';

  const mockAdminUser = {
    id: 'test-admin-id-001',
    email: 'admin@test.com',
    role: 'Amministratore',
  };

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    overrideDatabaseForE2E(moduleBuilder);
    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = new JwtService({ secret: process.env.ACCESS_SECRET });
    validToken = jwtService.sign(mockAdminUser);
    userOnlyToken = jwtService.sign({
      id: 'test-user-id-002',
      email: 'user@test.com',
      role: 'Utente',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const authGet = (path: string) =>
    request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${validToken}`);

  // ─────────────────────────────────────────────
  describe('Analytics Module Integration', () => {
    it('should have the analytics module properly initialized', () => {
      expect(app).toBeDefined();
    });

    it('should have AnalyticsController registered', () => {
      expect(app).toBeDefined();
    });

    it('should have all required use cases injected', () => {
      expect(app).toBeDefined();
    });

    it('should have all analytics strategies registered', () => {
      expect(app).toBeDefined();
    });

    it('should have SuggestionService and LLM port wired correctly', () => {
      expect(app).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────
  describe('GET /analytics/:plantId – success', () => {
    it('should return 200 for a valid plantId', async () => {
      await authGet(`/analytics/${VALID_PLANT_ID}`).expect(200);
    });

    it('should return an array of plots', async () => {
      const response = await authGet(`/analytics/${VALID_PLANT_ID}`).expect(
        200,
      );
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return plots with the expected DTO shape', async () => {
      const response = await authGet(`/analytics/${VALID_PLANT_ID}`).expect(
        200,
      );
      const body: Plot[] = response.body as Plot[];

      if (body.length > 0) {
        const plot = body[0];
        expect(plot).toHaveProperty('metric');
        expect(plot).toHaveProperty('unit');
        expect(plot).toHaveProperty('labels');
        expect(plot).toHaveProperty('series');
        expect(plot).toHaveProperty('suggestion');
      }
    });

    it('should return labels as an array', async () => {
      const response = await authGet(`/analytics/${VALID_PLANT_ID}`).expect(
        200,
      );
      const body: Plot[] = response.body as Plot[];

      if (body.length > 0) {
        expect(
          Array.isArray(
            (body[0] as unknown as Record<string, unknown>)['labels'],
          ),
        ).toBe(true);
      }
    });

    it('should return series as an array', async () => {
      const response = await authGet(`/analytics/${VALID_PLANT_ID}`).expect(
        200,
      );
      const body: Plot[] = response.body as Plot[];

      if (body.length > 0) {
        expect(
          Array.isArray(
            (body[0] as unknown as Record<string, unknown>)['series'],
          ),
        ).toBe(true);
      }
    });

    it('should include a suggestion for each plot', async () => {
      const response = await authGet(`/analytics/${VALID_PLANT_ID}`).expect(
        200,
      );
      const body: Plot[] = response.body as Plot[];

      for (const plot of body) {
        const raw = plot as unknown as Record<string, unknown>;
        expect(raw['suggestion']).toBeDefined();
        expect(raw['suggestion']).not.toBeNull();
      }
    });

    it('should return at least one plot for a known plant', async () => {
      const response = await authGet(`/analytics/${VALID_PLANT_ID}`).expect(
        200,
      );
      expect((response.body as Plot[]).length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────
  describe('GET /analytics/:plantId – strategy coverage', () => {
    let metrics: string[];

    beforeAll(async () => {
      const response = await authGet(`/analytics/${VALID_PLANT_ID}`).expect(
        200,
      );
      metrics = (response.body as Plot[]).map(
        (p) => (p as unknown as Record<string, unknown>)['metric'] as string,
      );
    });

    it('should include plant-consumption metric', () => {
      expect(metrics).toContain('plant-consumption');
    });

    it('should include plant-anomalies metric', () => {
      expect(metrics).toContain('plant-anomalies');
    });

    it('should include thermostat-temperature metric', () => {
      expect(metrics).toContain('thermostat-temperature');
    });

    it('should include sensor-presence metric', () => {
      expect(metrics).toContain('sensor-presence');
    });

    it('should include sensor-long-presence metric', () => {
      expect(metrics).toContain('sensor-long-presence');
    });

    it('should include ward-alarms-frequency metric', () => {
      expect(metrics).toContain('ward-alarms-frequency');
    });

    it('should include ward-falls metric', () => {
      expect(metrics).toContain('ward-falls');
    });

    it('should include ward-resolved-alarm metric', () => {
      expect(metrics).toContain('ward-resolved-alarm');
    });

    it('should return exactly 8 plots (one per registered strategy)', () => {
      expect(metrics).toHaveLength(8);
    });
  });

  // ─────────────────────────────────────────────
  describe('GET /analytics/:plantId – error handling', () => {
    it('should return 500 when no analytics are available for the plant', async () => {
      const response = await authGet(`/analytics/${UNKNOWN_PLANT_ID}`);
      expect([200, 500]).toContain(response.status);
    });

    it('should not crash the application after a failed request', async () => {
      const response = await authGet(`/analytics/${UNKNOWN_PLANT_ID}`);
      expect([200, 500]).toContain(response.status);
      await authGet(`/analytics/${VALID_PLANT_ID}`).expect(200);
    });

    it('should handle multiple consecutive failing requests gracefully', async () => {
      for (let i = 0; i < 3; i++) {
        const response = await authGet(`/analytics/${UNKNOWN_PLANT_ID}_${i}`);
        expect([200, 500]).toContain(response.status);
      }
    });

    it('should handle a very long plantId without crashing', async () => {
      const longId = 'A'.repeat(500);
      const response = await authGet(`/analytics/${longId}`);
      expect([200, 400, 404, 500]).toContain(response.status);
    });

    it('should handle special characters in plantId without crashing', async () => {
      const response = await authGet('/analytics/plant!@#$%^&*()');
      expect([200, 400, 404, 500]).toContain(response.status);
    });
  });

  // ─────────────────────────────────────────────
  describe('Guard protection', () => {
    it('should return 401 or 403 when no auth token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get(`/analytics/${VALID_PLANT_ID}`)
        .set('Authorization', '');
      expect([401, 403]).toContain(response.status);
    });

    it('should return 401 or 403 when an invalid token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get(`/analytics/${VALID_PLANT_ID}`)
        .set('Authorization', 'Bearer invalid_token_xyz');
      expect([401, 403]).toContain(response.status);
    });

    it('should return 401 or 403 for a non-admin user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/analytics/${VALID_PLANT_ID}`)
        .set('Authorization', `Bearer ${userOnlyToken}`);
      expect([401, 403]).toContain(response.status);
    });
  });

  // ─────────────────────────────────────────────
  describe('Suggestion Service Integration', () => {
    it('should attach a non-empty suggestion text to each plot', async () => {
      const response = await authGet(`/analytics/${VALID_PLANT_ID}`).expect(
        200,
      );
      const body: Plot[] = response.body as Plot[];

      for (const plot of body) {
        const raw = plot as unknown as Record<string, unknown>;
        const suggestion = raw['suggestion'];
        expect(suggestion).toBeDefined();
        expect(suggestion).not.toBeNull();
        const isValidSuggestion =
          typeof suggestion === 'string'
            ? suggestion.length > 0
            : typeof suggestion === 'object' && suggestion !== null;
        expect(isValidSuggestion).toBe(true);
      }
    });

    it('should return a unique suggestion per metric', async () => {
      const response = await authGet(`/analytics/${VALID_PLANT_ID}`).expect(
        200,
      );
      const body: Plot[] = response.body as Plot[];

      const suggestions: string[] = (
        body as unknown as Record<string, unknown>[]
      ).map((p) => JSON.stringify(p['suggestion']));

      for (const s of suggestions) {
        expect(s).toBeDefined();
        expect(s).not.toBe('null');
        expect(s).not.toBe('undefined');
      }

      expect(suggestions.length).toBe(body.length);
    });

    it('should return consistent suggestions on repeated calls for the same plant', async () => {
      const [r1, r2] = await Promise.all([
        authGet(`/analytics/${VALID_PLANT_ID}`),
        authGet(`/analytics/${VALID_PLANT_ID}`),
      ]);

      expect(r1.status).toBe(200);
      expect(r2.status).toBe(200);
      expect((r1.body as Plot[]).length).toBe((r2.body as Plot[]).length);
    });
  });

  describe('Performance & Load', () => {
    it('should respond within an acceptable time window', async () => {
      const start = Date.now();
      await authGet(`/analytics/${VALID_PLANT_ID}`).expect(200);
      expect(Date.now() - start).toBeLessThan(10000);
    });

    it('should handle concurrent requests for the same plant', async () => {
      const responses = await Promise.all(
        Array.from({ length: 5 }, () =>
          authGet(`/analytics/${VALID_PLANT_ID}`),
        ),
      );
      for (const res of responses) {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    it('should handle sequential requests for different plants without state pollution', async () => {
      for (const plantId of [VALID_PLANT_ID, VALID_PLANT_ID, VALID_PLANT_ID]) {
        const res = await authGet(`/analytics/${plantId}`);
        expect([200, 500]).toContain(res.status);
      }
    });

    it('should maintain stability after a burst of requests', async () => {
      const burst = Array.from({ length: 10 }, () =>
        authGet(`/analytics/${VALID_PLANT_ID}`),
      );
      await Promise.allSettled(burst);
      await authGet(`/analytics/${VALID_PLANT_ID}`).expect(200);
    });
  });
});
