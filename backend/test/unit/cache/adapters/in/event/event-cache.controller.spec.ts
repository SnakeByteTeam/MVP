import { Test } from '@nestjs/testing';
import { EventEmitterModule, EventEmitter2 } from '@nestjs/event-emitter';
import { EventCacheController } from 'src/cache/adapters/in/event/event-cache.controller';
import {
  UpdateCacheAllPlantsUseCase,
  UPDATE_CACHE_ALL_PLANTS_USECASE,
} from 'src/cache/application/ports/in/update-cache-all-plants.usecase';

describe('EventCacheController', () => {
  let emitter: EventEmitter2;
  let useCase: jest.Mocked<UpdateCacheAllPlantsUseCase>;

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

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

    emitter = moduleRef.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call updateAllCache when fetched.tokens event is emitted', async () => {
    await emitter.emitAsync('fetched.tokens');

    // Wait for event to be processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(useCase.updateAllCache).toHaveBeenCalledTimes(1);
  });

  it('should skip duplicate fetched.tokens while a sync is already running', async () => {
    let resolveUpdate: (() => void) | undefined;
    useCase.updateAllCache.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveUpdate = () => resolve(true);
        }),
    );

    const firstEmit = emitter.emitAsync('fetched.tokens');

    await new Promise((resolve) => setTimeout(resolve, 0));

    const secondEmit = emitter.emitAsync('fetched.tokens');

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(useCase.updateAllCache).toHaveBeenCalledTimes(1);

    resolveUpdate?.();

    await firstEmit;
    await secondEmit;
  });
});
