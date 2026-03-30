import { Test } from '@nestjs/testing';
import { EventEmitterModule, EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateCacheAllPlantsUseCase } from 'src/cache/application/ports/in/update-cache-all-plants.usecase';
import { EventCacheController } from './event-cache.controller';
import { UPDATE_CACHE_ALL_PLANTS_USECASE } from 'src/cache/application/ports/in/update-cache-all-plants.usecase';

describe('EventCacheController', () => {
  let controller: EventCacheController;
  let emitter: EventEmitter2;
  let useCase: jest.Mocked<UpdateCacheAllPlantsUseCase>;

  beforeEach(async () => {
    useCase = {
      updateAllCache: jest.fn().mockResolvedValue(true),
    } as any;

    const moduleRef = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      controllers: [EventCacheController],
      providers: [
        {
          provide: UPDATE_CACHE_ALL_PLANTS_USECASE,
          useValue: useCase,
        },
      ],
    }).compile();

    await moduleRef.init();

    controller = moduleRef.get<EventCacheController>(EventCacheController);
    emitter = moduleRef.get<EventEmitter2>(EventEmitter2);
  });

  it('should call updateAllCache when fetched.tokens event is emitted', async () => {
    await emitter.emitAsync('fetched.tokens');

    // Wait for event to be processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(useCase.updateAllCache).toHaveBeenCalledTimes(1);
  });
});
