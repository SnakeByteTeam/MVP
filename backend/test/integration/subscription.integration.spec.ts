import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { GETVALIDTOKENPORT } from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import { GET_ALL_PLANTIDS_PORT } from 'src/cache/application/ports/out/get-all-plantids.port';
import { DatabaseModule, PG_POOL } from 'src/database/database.module';
import { EventSubscriptionController } from 'src/subscription/adapters/in/event/event-sub.controller';
import { SUBSCRIPTION_REPOSITORY_PORT } from 'src/subscription/application/repository/subscription.repository';
import { SubscriptionModule } from 'src/subscription/subscription.module';

describe('Subscription Integration Test', () => {
  let app: INestApplication;
  let eventEmitter: EventEmitter2;
  let eventSubscriptionController: EventSubscriptionController;

  const mockPool = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: jest.fn(),
    }),
    end: jest.fn(),
    on: jest.fn(),
  };

  const mockGetValidTokenPort = {
    getValidToken: jest.fn<Promise<string | null>, []>(),
  };

  const mockGetAllPlantIdsPort = {
    getAllPlantIds: jest.fn<Promise<string[]>, []>(),
  };

  const mockSubscriptionRepository = {
    refreshSub: jest.fn<Promise<boolean>, [string, string]>(),
    refreshDatapointSub: jest.fn<Promise<boolean>, [string, string]>(),
  };

  beforeEach(async () => {
    mockGetValidTokenPort.getValidToken.mockResolvedValue('valid-token');
    mockGetAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
      'plant-1',
      'plant-2',
    ]);
    mockSubscriptionRepository.refreshSub.mockResolvedValue(true);
    mockSubscriptionRepository.refreshDatapointSub.mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), DatabaseModule, SubscriptionModule],
    })
      .overrideProvider(PG_POOL)
      .useValue(mockPool)
      .overrideProvider(GETVALIDTOKENPORT)
      .useValue(mockGetValidTokenPort)
      .overrideProvider(GET_ALL_PLANTIDS_PORT)
      .useValue(mockGetAllPlantIdsPort)
      .overrideProvider(SUBSCRIPTION_REPOSITORY_PORT)
      .useValue(mockSubscriptionRepository)
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

    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    eventSubscriptionController = module.get<EventSubscriptionController>(
      EventSubscriptionController,
    );
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    jest.clearAllMocks();
  });

  it('should refresh subscriptions for a single plant on cache.updated event', async () => {
    eventEmitter.emit('cache.updated', { plantId: 'plant-1' });

    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(mockSubscriptionRepository.refreshSub).toHaveBeenCalledWith(
      'valid-token',
      'plant-1',
    );
    expect(mockSubscriptionRepository.refreshDatapointSub).toHaveBeenCalledWith(
      'valid-token',
      'plant-1',
    );
  });

  it('should refresh all subscriptions on cache.all.updated event', async () => {
    eventEmitter.emit('cache.all.updated');

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(mockGetAllPlantIdsPort.getAllPlantIds).toHaveBeenCalledTimes(2);
    expect(mockSubscriptionRepository.refreshSub).toHaveBeenCalledTimes(2);
    expect(mockSubscriptionRepository.refreshDatapointSub).toHaveBeenCalledTimes(
      2,
    );
  });

  it('should execute node subscription cron flow', async () => {
    await eventSubscriptionController.refreshNodeSubscriptions();

    expect(mockGetAllPlantIdsPort.getAllPlantIds).toHaveBeenCalledTimes(1);
    expect(mockSubscriptionRepository.refreshSub).toHaveBeenCalledTimes(2);
  });
});
