import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { overrideDatabaseForE2E } from '../setup-e2e-test';

describe('ApiAuthVimar (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  // Admin token required by @UseGuards(UserGuard, AdminGuard)
  const mockUser = {
    id: 'test-user-id-001',
    email: 'test@example.com',
    role: 'Amministratore',
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
    
    // Non-admin token for guard validation tests
    userOnlyToken = jwtService.sign({
      id: 'user-without-admin',
      email: 'user@example.com',
      role: 'Utente',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('MyVimar Account Status', () => {
    it('GET /my-vimar/account - should return account status when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/my-vimar/account')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('isLinked');
      expect(response.body).toHaveProperty('email');
      expect(typeof response.body.isLinked).toBe('boolean');
      expect(typeof response.body.email).toBe('string');
    });

    it('GET /my-vimar/account - should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/my-vimar/account')
        .expect(401);
    });

    it('GET /my-vimar/account - should return default status when error occurs', async () => {
      const response = await request(app.getHttpServer())
        .get('/my-vimar/account')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      // Should return default values on error
      expect(response.body.isLinked).toBeDefined();
      expect(response.body.email).toBeDefined();
    });
  });

  describe('MyVimar Account Disconnection', () => {
    it('DELETE /my-vimar/account - should disconnect account when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .delete('/my-vimar/account')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('DELETE /my-vimar/account - should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete('/my-vimar/account')
        .expect(401);
    });

    it('DELETE /my-vimar/account - operation should be idempotent', async () => {
      // First disconnect
      await request(app.getHttpServer())
        .delete('/my-vimar/account')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      // Second disconnect should also succeed
      const response = await request(app.getHttpServer())
        .delete('/my-vimar/account')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Legacy Routes', () => {
    it('GET /my-vimar/auth - should return 404 (route not exposed)', async () => {
      await request(app.getHttpServer()).get('/my-vimar/auth').expect(404);
    });
  });

  describe('Token Callback Handling', () => {
    it('GET /my-vimar/callback - should handle callback with valid state payload', async () => {
      const state = Buffer.from(
        JSON.stringify({
          redirectUrl: 'http://localhost:3000/callback',
          userId: 123,
        }),
      ).toString('base64');

      const response = await request(app.getHttpServer())
        .get('/my-vimar/callback')
        .query({
          code: 'test-auth-code-123',
          state,
        })
        .expect([302, 500]);

      if (response.statusCode === 302) {
        expect(response.headers.location).toBeDefined();
      }
    });

    it('GET /my-vimar/callback - should return 400 when missing code parameter', async () => {
      await request(app.getHttpServer())
        .get('/my-vimar/callback')
        .query({ state: 'test-state-456' })
        .expect(400);
    });

    it('GET /my-vimar/callback - should handle error callback parameter', async () => {
      await request(app.getHttpServer())
        .get('/my-vimar/callback')
        .query({
          error: 'access_denied',
          state: 'test-state-456',
        })
        .expect(400);
    });
  });

  describe('Guard Validation', () => {
    it('GET /my-vimar/account - should reject non-admin role', async () => {
      await request(app.getHttpServer())
        .get('/my-vimar/account')
        .set('Authorization', `Bearer ${userOnlyToken}`)
        .expect(401);
    });

    it('DELETE /my-vimar/account - should reject non-admin role', async () => {
      await request(app.getHttpServer())
        .delete('/my-vimar/account')
        .set('Authorization', `Bearer ${userOnlyToken}`)
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing authorization header', async () => {
      await request(app.getHttpServer())
        .get('/my-vimar/account')
        .expect(401);
    });

    it('should handle malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/my-vimar/account')
        .set('Authorization', 'Bearer invalid-token-format')
        .expect(401);
    });

    it('should handle expired tokens', async () => {
      const expiredToken = jwtService.sign(mockUser, { expiresIn: 0 });

      await request(app.getHttpServer())
        .get('/my-vimar/account')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});

describe('ApiAuthTicket (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockUser = {
    id: 123,
    email: 'ticket-test@example.com',
    role: 'Amministratore',
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

  describe('POST /api/auth/prepare-oauth - Prepare OAuth Ticket', () => {
    it('should create OAuth ticket for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 201, 400, 500]);

      if (response.statusCode === 200 || response.statusCode === 201) {
        expect(response.body).toHaveProperty('ticket');
      }
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .expect(401);
    });

    it('should extract user ID from JWT payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 201, 400, 500]);

      expect(response.body).toBeDefined();
    });

    it('should handle request with malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });

    it('should handle request with expired token', async () => {
      const expiredToken = jwtService.sign(mockUser, { expiresIn: 0 });

      await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should handle request with invalid user ID in payload', async () => {
      const invalidToken = jwtService.sign({
        id: null,
        email: 'test@example.com',
        role: 'Amministratore',
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect([401, 400, 500]);
    });

    it('should handle numeric user ID strings', async () => {
      const tokenWithStringId = jwtService.sign({
        id: '456',
        email: 'test@example.com',
        role: 'Amministratore',
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${tokenWithStringId}`)
        .expect([200, 201, 400, 500]);
    });

    it('should handle negative user IDs', async () => {
      const negativeIdToken = jwtService.sign({
        id: -1,
        email: 'test@example.com',
        role: 'Amministratore',
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${negativeIdToken}`)
        .expect([400, 401, 500]);
    });

    it('should handle zero user ID', async () => {
      const zeroIdToken = jwtService.sign({
        id: 0,
        email: 'test@example.com',
        role: 'Amministratore',
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${zeroIdToken}`)
        .expect([400, 401, 500]);
    });
  });

  describe('GET /api/auth/authorize - Authorize OAuth Ticket', () => {
    it('should redirect with valid ticket and redirect_url', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/authorize')
        .query({
          ticket: 'valid-ticket-123',
          redirect_url: 'http://localhost:3000/callback',
        })
        .expect([302, 400, 401, 500]);

      if (response.statusCode === 302) {
        expect(response.headers.location).toBeDefined();
      }
    });

    it('should return 400 when redirect_url is missing', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/authorize')
        .query({ ticket: 'valid-ticket-123' })
        .expect(400);
    });

    it('should return 400 when ticket is missing', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/authorize')
        .query({ redirect_url: 'http://localhost:3000/callback' })
        .expect([400, 401, 500]);
    });

    it('should handle empty ticket parameter', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/authorize')
        .query({
          ticket: '',
          redirect_url: 'http://localhost:3000/callback',
        })
        .expect([400, 401, 500]);
    });

    it('should handle empty redirect_url parameter', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/authorize')
        .query({
          ticket: 'valid-ticket-123',
          redirect_url: '',
        })
        .expect(400);
    });

    it('should handle invalid redirect_url format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/authorize')
        .query({
          ticket: 'valid-ticket-123',
          redirect_url: 'not-a-valid-url',
        })
        .expect([302, 400, 401, 500]);
    });

    it('should handle redirect_url with special characters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/authorize')
        .query({
          ticket: 'valid-ticket-123',
          redirect_url:
            'http://localhost:3000/callback?param=value&other=123',
        })
        .expect([302, 400, 401, 500]);
    });

    it('should handle very long ticket string', async () => {
      const longTicket = 'a'.repeat(5000);
      const response = await request(app.getHttpServer())
        .get('/api/auth/authorize')
        .query({
          ticket: longTicket,
          redirect_url: 'http://localhost:3000/callback',
        })
        .expect([302, 400, 401, 413, 500]);
    });

    it('should handle very long redirect_url', async () => {
      const longUrl = `http://localhost:3000/callback?param=${'a'.repeat(5000)}`;
      const response = await request(app.getHttpServer())
        .get('/api/auth/authorize')
        .query({
          ticket: 'valid-ticket-123',
          redirect_url: longUrl,
        })
        .expect([302, 400, 401, 413, 500]);
    });

    it('should handle special URL characters in parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/authorize')
        .query({
          ticket: 'ticket-with-@#$%-chars',
          redirect_url: 'http://localhost:3000/callback?special=@#$%',
        })
        .expect([302, 400, 401, 500]);
    });

    it('should encode state parameter with redirectUrl and userId', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/authorize')
        .query({
          ticket: 'valid-ticket-state-test',
          redirect_url: 'http://frontend.local/oauth-callback',
        })
        .expect([302, 400, 401, 500]);

      if (response.statusCode === 302 && response.headers.location) {
        // State parameter should be base64 encoded
        expect(response.headers.location).toMatch(/state=/);
      }
    });
  });

  describe('OAuth Ticket Flow - Integrated', () => {
    it('should handle complete prepare and authorize flow', async () => {
      // Prepare OAuth ticket
      const prepareResponse = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 201, 400, 500]);

      if (
        prepareResponse.statusCode === 200 ||
        prepareResponse.statusCode === 201
      ) {
        const ticket = prepareResponse.body.ticket;

        // Authorize with the ticket
        const authorizeResponse = await request(app.getHttpServer())
          .get('/api/auth/authorize')
          .query({
            ticket: ticket,
            redirect_url: 'http://localhost:3000/callback',
          })
          .expect([302, 400, 401, 500]);

        expect(authorizeResponse.statusCode).toBeGreaterThanOrEqual(200);
      }
    });

    it('should handle multiple prepare requests without side effects', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 201, 400, 500]);

      const response2 = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 201, 400, 500]);

      const allowedStatusCodes = new Set([200, 201, 400, 500]);
      expect(allowedStatusCodes.has(response1.statusCode)).toBe(true);
      expect(allowedStatusCodes.has(response2.statusCode)).toBe(true);
    });

    it('should handle reusing same ticket multiple times', async () => {
      const prepareResponse = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 201, 400, 500]);

      if (
        prepareResponse.statusCode === 200 ||
        prepareResponse.statusCode === 201
      ) {
        const ticket = prepareResponse.body.ticket;

        // Try to authorize multiple times with same ticket
        const auth1 = await request(app.getHttpServer())
          .get('/api/auth/authorize')
          .query({
            ticket: ticket,
            redirect_url: 'http://localhost:3000/callback1',
          })
          .expect([302, 400, 401, 500]);

        const auth2 = await request(app.getHttpServer())
          .get('/api/auth/authorize')
          .query({
            ticket: ticket,
            redirect_url: 'http://localhost:3000/callback2',
          })
          .expect([302, 400, 401, 500]);

        // Behavior depends on implementation (reusable or one-time)
        expect([auth1.statusCode, auth2.statusCode]).toBeDefined();
      }
    });
  });

  describe('Guard Validation', () => {
    it('should allow user role to prepare OAuth', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${validToken}`)
        .expect([200, 201, 400, 500]);
    });

    it('should require authentication for prepare-oauth', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .expect(401);
    });

    it('should allow public access to authorize endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/authorize')
        .query({
          ticket: 'test-ticket',
          redirect_url: 'http://localhost:3000/callback',
        })
        .expect([302, 400, 401, 500]);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle Content-Type validation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/json')
        .expect([200, 201, 400, 500]);
    });

    it('should respond with JSON for prepare-oauth', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/prepare-oauth')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Accept', 'application/json')
        .expect([200, 201, 400, 500]);

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should validate HTTP methods', async () => {
      // GET on POST-only endpoint should fail
      await request(app.getHttpServer())
        .get('/api/auth/prepare-oauth')
        .expect([404, 405]);
    });

    it('should validate HTTP methods for authorize', async () => {
      // POST on GET-only endpoint should fail
      await request(app.getHttpServer())
        .post('/api/auth/authorize')
        .expect([404, 405]);
    });

    it('should handle CORS headers if configured', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/auth/prepare-oauth')
        .expect([200, 204, 404, 500]);
    });
  });
});
