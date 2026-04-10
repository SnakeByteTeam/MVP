import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import { UserEntity } from 'src/users/infrastructure/entities/user-entity';
import { USER_REPOSITORY } from 'src/users/application/repository/user-repository.interface';
import { UsersModule } from 'src/users/users.module';

describe('Users Integration Test', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const ACCESS_SECRET = 'integration-access-secret';

  const mockUserRepository = {
    createUser: jest.fn<
      Promise<UserEntity>,
      [string, string, string, string]
    >(),
    deleteUser: jest.fn<Promise<void>, [number]>(),
    findAllAvailableUsers: jest.fn<Promise<UserEntity[]>, []>(),
    findAllUsers: jest.fn<Promise<UserEntity[]>, []>(),
    updateUser: jest.fn<Promise<UserEntity>, [number, string, string, string]>(),
    findUserById: jest.fn<Promise<UserEntity | null>, [number]>(),
  };

  beforeEach(async () => {
    process.env.ACCESS_SECRET = ACCESS_SECRET;

    mockUserRepository.findAllUsers.mockResolvedValue([
      new UserEntity(1, 'admin.user', 'Rossi', 'Mario', 'AMMINISTRATORE'),
      new UserEntity(2, 'normal.user', 'Verdi', 'Luca', 'UTENTE'),
    ]);
    mockUserRepository.findAllAvailableUsers.mockResolvedValue([
      new UserEntity(3, 'available.user', 'Bianchi', 'Anna', 'UTENTE'),
    ]);
    mockUserRepository.findUserById.mockResolvedValue(
      new UserEntity(1, 'admin.user', 'Rossi', 'Mario', 'AMMINISTRATORE'),
    );
    mockUserRepository.createUser.mockResolvedValue(
      new UserEntity(10, 'new.user', 'Neri', 'Paolo', 'UTENTE'),
    );
    mockUserRepository.updateUser.mockResolvedValue(
      new UserEntity(1, 'edited.user', 'Rossi', 'Marco', 'AMMINISTRATORE'),
    );
    mockUserRepository.deleteUser.mockResolvedValue();

    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(USER_REPOSITORY)
      .useValue(mockUserRepository)
      .compile();

    app = module.createNestApplication();
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

  const buildToken = (role: string) =>
    jwtService.sign({ id: 1, username: 'admin.user', role, firstAccess: false });

  it('should retrieve all users for an admin', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/users')
      .set('Authorization', `Bearer ${buildToken('AMMINISTRATORE')}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(mockUserRepository.findAllUsers).toHaveBeenCalledTimes(1);
  });

  it('should create a user and return generated temp password', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/users')
      .set('Authorization', `Bearer ${buildToken('AMMINISTRATORE')}`)
      .send({
        username: 'new.user',
        surname: 'Neri',
        name: 'Paolo',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id', 10);
    expect(response.body).toHaveProperty('username', 'new.user');
    expect(response.body).toHaveProperty('tempPassword');
    expect(typeof response.body.tempPassword).toBe('string');
    expect(mockUserRepository.createUser).toHaveBeenCalledTimes(1);
  });

  it('should reject non-admin user on guarded route', async () => {
    await request(app.getHttpServer() as http.Server)
      .get('/users')
      .set('Authorization', `Bearer ${buildToken('UTENTE')}`)
      .expect(401);
  });

  it('should validate payload on update user', async () => {
    await request(app.getHttpServer() as http.Server)
      .put('/users/1')
      .set('Authorization', `Bearer ${buildToken('AMMINISTRATORE')}`)
      .send({
        username: 'abc',
        surname: 'R',
        name: 'M',
      })
      .expect(400);

    expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
  });

  it('should retrieve available users', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/users/available')
      .set('Authorization', `Bearer ${buildToken('AMMINISTRATORE')}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('username', 'available.user');
  });
});
