import { Test, TestingModule } from '@nestjs/testing';
import { GetAnalyticsUseCase } from './get-analytics.usecase';

describe('In', () => {
  let provider: GetAnalyticsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [getAnalyticsUseCase],
    }).compile();

    provider = module.get<GetAnalyticsUseCase>(getAnalyticsUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
