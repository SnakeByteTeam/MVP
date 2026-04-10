import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import { ADD_PLANT_TO_WARD_REPOSITORY } from 'src/wards/application/repository/add-plant-to-ward-repository.interface';
import { ADD_USER_TO_WARD_REPOSITORY } from 'src/wards/application/repository/add-user-to-ward-repository.interface';
import { CREATE_WARD_REPOSITORY } from 'src/wards/application/repository/create-ward-repository.interface';
import { DELETE_WARD_REPOSITORY } from 'src/wards/application/repository/delete-ward-repository.interface';
import { FIND_ALL_PLANTS_BY_WARD_ID_REPOSITORY } from 'src/wards/application/repository/find-all-plants-by-ward-id-repository.interface';
import { FIND_ALL_USERS_BY_WARD_ID_REPOSITORY } from 'src/wards/application/repository/find-all-users-by-ward-id-repository.interface';
import { FIND_ALL_WARDS_REPOSITORY } from 'src/wards/application/repository/find-all-wards-repository.interface';
import { REMOVE_PLANT_FROM_WARD_REPOSITORY } from 'src/wards/application/repository/remove-plant-from-ward-repository.interface';
import { REMOVE_USER_FROM_WARD_REPOSITORY } from 'src/wards/application/repository/remove-user-from-ward-repository.interface';
import { UPDATE_WARD_REPOSITORY } from 'src/wards/application/repository/update-ward-repository.interface';
import { PlantEntity } from 'src/wards/infrastructure/entities/plant-entity';
import { UserEntity } from 'src/wards/infrastructure/entities/user-entity';
import { WardEntity } from 'src/wards/infrastructure/entities/ward-entity';
import { WardsModule } from 'src/wards/wards.module';

describe('Wards Integration Test', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const ACCESS_SECRET = 'integration-access-secret';

  const mockWardsRepository = {
    createWard: jest.fn<Promise<WardEntity>, [string]>(),
    findAllWards: jest.fn<Promise<WardEntity[]>, []>(),
    updateWard: jest.fn<Promise<WardEntity>, [number, string]>(),
    deleteWard: jest.fn<Promise<void>, [number]>(),
  };

  const mockWardsUsersRepository = {
    addUserToWard: jest.fn<Promise<UserEntity>, [number, number]>(),
    findAllUsersByWardId: jest.fn<Promise<UserEntity[]>, [number]>(),
    removeUserFromWard: jest.fn<Promise<void>, [number, number]>(),
  };

  const mockWardsPlantsRepository = {
    addPlantToWard: jest.fn<Promise<PlantEntity>, [number, string]>(),
    findAllPlantsByWardId: jest.fn<Promise<PlantEntity[]>, [number]>(),
    removePlantFromWard: jest.fn<Promise<void>, [string]>(),
  };

  beforeEach(async () => {
    process.env.ACCESS_SECRET = ACCESS_SECRET;

    mockWardsRepository.createWard.mockResolvedValue(new WardEntity(1, 'Cardiology'));
    mockWardsRepository.findAllWards.mockResolvedValue([
      new WardEntity(1, 'Cardiology'),
      new WardEntity(2, 'Neurology'),
    ]);
    mockWardsRepository.updateWard.mockResolvedValue(
      new WardEntity(1, 'Cardiology Updated'),
    );
    mockWardsRepository.deleteWard.mockResolvedValue();

    mockWardsUsersRepository.addUserToWard.mockResolvedValue(
      new UserEntity(11, 'ward.user'),
    );
    mockWardsUsersRepository.findAllUsersByWardId.mockResolvedValue([
      new UserEntity(11, 'ward.user'),
    ]);
    mockWardsUsersRepository.removeUserFromWard.mockResolvedValue();

    mockWardsPlantsRepository.addPlantToWard.mockResolvedValue(
      new PlantEntity('plant-1', 'Main Plant'),
    );
    mockWardsPlantsRepository.findAllPlantsByWardId.mockResolvedValue([
      new PlantEntity('plant-1', 'Main Plant'),
    ]);
    mockWardsPlantsRepository.removePlantFromWard.mockResolvedValue();

    const module: TestingModule = await Test.createTestingModule({
      imports: [WardsModule],
    })
      .overrideProvider(CREATE_WARD_REPOSITORY)
      .useValue(mockWardsRepository)
      .overrideProvider(FIND_ALL_WARDS_REPOSITORY)
      .useValue(mockWardsRepository)
      .overrideProvider(UPDATE_WARD_REPOSITORY)
      .useValue(mockWardsRepository)
      .overrideProvider(DELETE_WARD_REPOSITORY)
      .useValue(mockWardsRepository)
      .overrideProvider(ADD_USER_TO_WARD_REPOSITORY)
      .useValue(mockWardsUsersRepository)
      .overrideProvider(FIND_ALL_USERS_BY_WARD_ID_REPOSITORY)
      .useValue(mockWardsUsersRepository)
      .overrideProvider(REMOVE_USER_FROM_WARD_REPOSITORY)
      .useValue(mockWardsUsersRepository)
      .overrideProvider(ADD_PLANT_TO_WARD_REPOSITORY)
      .useValue(mockWardsPlantsRepository)
      .overrideProvider(FIND_ALL_PLANTS_BY_WARD_ID_REPOSITORY)
      .useValue(mockWardsPlantsRepository)
      .overrideProvider(REMOVE_PLANT_FROM_WARD_REPOSITORY)
      .useValue(mockWardsPlantsRepository)
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

  const adminToken = () =>
    jwtService.sign({ id: 1, username: 'admin', role: 'AMMINISTRATORE' });

  it('should create a ward', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/wards')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ name: 'Cardiology' })
      .expect(201);

    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('name', 'Cardiology');
    expect(mockWardsRepository.createWard).toHaveBeenCalledWith('Cardiology');
  });

  it('should list wards', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/wards')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('name', 'Cardiology');
  });

  it('should add a user to a ward', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .post('/wards-users-relationships')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ wardId: 1, userId: 11 })
      .expect(201);

    expect(response.body).toHaveProperty('id', 11);
    expect(response.body).toHaveProperty('username', 'ward.user');
    expect(mockWardsUsersRepository.addUserToWard).toHaveBeenCalledWith(1, 11);
  });

  it('should list plants by ward id', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/wards-plants-relationships/1')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('id', 'plant-1');
    expect(mockWardsPlantsRepository.findAllPlantsByWardId).toHaveBeenCalledWith(
      1,
    );
  });

  it('should remove a user from a ward', async () => {
    await request(app.getHttpServer() as http.Server)
      .delete('/wards-users-relationships/1/11')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(mockWardsUsersRepository.removeUserFromWard).toHaveBeenCalledWith(
      1,
      11,
    );
  });
});
