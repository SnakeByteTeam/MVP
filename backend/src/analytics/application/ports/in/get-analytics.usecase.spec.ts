import { Test, TestingModule } from '@nestjs/testing';
import { getAnalyticsUseCase } from './get-analytics.usecase';

describe('In', () => {
  let provider: getAnalyticsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [getAnalyticsUseCase],
    }).compile();

    provider = module.get<getAnalyticsUseCase>(getAnalyticsUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
