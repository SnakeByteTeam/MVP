import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AuthModule } from 'src/auth/auth.module';
import { CHANGE_CREDENTIALS_REPOSITORY } from 'src/auth/application/repository/change-credentials-repository.interface';
import { CHECK_CREDENTIALS_REPOSITORY } from 'src/auth/application/repository/check-credentials-repository.interface';
import { PayloadEntity } from 'src/auth/infrastructure/entities/payload-entity';

describe('Auth Integration Test', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const ACCESS_SECRET = 'integration-access-secret';
  const REFRESH_SECRET = 'integration-refresh-secret';

  const mockCheckCredentialsRepository = {
    checkCredentials: jest.fn<Promise<PayloadEntity>, [string, string]>(),
  };

  const mockChangeCredentialsRepository = {
    changeCredentials: jest.fn<Promise<void>, [string, string, boolean]>(),
  };

  beforeEach(async () => {
    process.env.ACCESS_SECRET = ACCESS_SECRET;
    process.env.REFRESH_SECRET = REFRESH_SECRET;

    mockCheckCredentialsRepository.checkCredentials.mockResolvedValue(
      new PayloadEntity(1, 'test.user', 'AMMINISTRATORE', false),
    );
    mockChangeCredentialsRepository.changeCredentials.mockResolvedValue();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(CHECK_CREDENTIALS_REPOSITORY)
      .useValue(mockCheckCredentialsRepository)
      .overrideProvider(CHANGE_CREDENTIALS_REPOSITORY)
      .useValue(mockChangeCredentialsRepository)
      .compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = new JwtService({ secret: ACCESS_SECRET });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should login and set refresh token cookie', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/auth/login')
      .send({ username: 'test.user', password: 'plain-password' })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(typeof response.body.accessToken).toBe('string');
    expect(response.headers['set-cookie']).toBeDefined();
    expect(mockCheckCredentialsRepository.checkCredentials).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should execute first-login flow with FirstLoginGuard', async () => {
    const firstAccessToken = jwtService.sign({
      id: 10,
      username: 'first.user',
      role: 'AMMINISTRATORE',
      firstAccess: true,
    });

    const response = await request(app.getHttpServer() as http.Server)
      .post('/auth/first-login')
      .set('Authorization', `Bearer ${firstAccessToken}`)
      .send({
        username: 'first.user',
        password: 'new-password',
        tempPassword: 'temp-password',
      })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(mockChangeCredentialsRepository.changeCredentials).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should refresh access token from refreshToken cookie', async () => {
    const loginResponse = await request(app.getHttpServer() as http.Server)
      .post('/auth/login')
      .send({ username: 'test.user', password: 'plain-password' })
      .expect(201);

    const refreshTokenCookie = loginResponse.headers['set-cookie'];

    const refreshResponse = await request(app.getHttpServer() as http.Server)
      .post('/auth/refresh')
      .set('Cookie', refreshTokenCookie)
      .expect(201);

    expect(refreshResponse.body).toHaveProperty('accessToken');
    expect(typeof refreshResponse.body.accessToken).toBe('string');
  });

  it('should return 401 when refresh token cookie is missing', async () => {
    await request(app.getHttpServer() as http.Server)
      .post('/auth/refresh')
      .expect(401);
  });

  it('should clear refresh token cookie on logout', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/auth/logout')
      .expect(201);

    expect(response.body).toEqual({ success: true });
  });
});