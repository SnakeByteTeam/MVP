import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as http from 'node:http';
import request from 'supertest';
import { DatabaseModule } from 'src/database/database.module';
import { Plant } from 'src/plant/domain/models/plant.model';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';
import { PlantModule } from 'src/plant/plant.module';
import { PLANT_REPOSITORY_PORT } from 'src/plant/application/repository/plant.repository';

describe('Plant Integration Test', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const ACCESS_SECRET = 'integration-access-secret';
  const PLANT_ID = 'plant-001';

  const mockPlantRepository = {
    findById: jest.fn<Promise<PlantEntity | null>, [string]>(),
    findAllAvailablePlants: jest.fn<Promise<PlantEntity[] | null>, []>(),
    findAllPlants: jest.fn<Promise<PlantEntity[] | null>, []>(),
  };

  const makePlantEntity = (id: string, name: string): PlantEntity =>
    PlantEntity.fromDomain(new Plant(id, name, [], 1));

  beforeEach(async () => {
    process.env.ACCESS_SECRET = ACCESS_SECRET;

    mockPlantRepository.findById.mockResolvedValue(
      makePlantEntity(PLANT_ID, 'Main Plant'),
    );
    mockPlantRepository.findAllAvailablePlants.mockResolvedValue([
      makePlantEntity('plant-available-1', 'Available Plant'),
    ]);
    mockPlantRepository.findAllPlants.mockResolvedValue([
      makePlantEntity('plant-available-1', 'Available Plant'),
      makePlantEntity('plant-other-2', 'Other Plant'),
    ]);

    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, PlantModule],
    })
      .overrideProvider(PLANT_REPOSITORY_PORT)
      .useValue(mockPlantRepository)
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

  const userToken = () =>
    jwtService.sign({ id: 20, username: 'user', role: 'UTENTE' });

  it('should retrieve a plant by plantid query parameter', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/plant')
      .query({ plantid: PLANT_ID })
      .set('Authorization', `Bearer ${userToken()}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', PLANT_ID);
    expect(response.body).toHaveProperty('name', 'Main Plant');
    expect(mockPlantRepository.findById).toHaveBeenCalledWith(PLANT_ID);
  });

  it('should return 404 when plantid is missing', async () => {
    await request(app.getHttpServer() as http.Server)
      .get('/plant')
      .set('Authorization', `Bearer ${userToken()}`)
      .expect(404);
  });

  it('should return all available plants', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get('/plant/available')
      .set('Authorization', `Bearer ${userToken()}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('id', 'plant-available-1');
  });

  it('should return fallback payload when all plants retrieval fails', async () => {
    mockPlantRepository.findAllPlants.mockResolvedValue(null);

    const response = await request(app.getHttpServer() as http.Server)
      .get('/plant/all')
      .set('Authorization', `Bearer ${userToken()}`)
      .expect(200);

    expect(response.body).toEqual({
      message: 'No plants found',
      statusCode: 202,
    });
  });
});
