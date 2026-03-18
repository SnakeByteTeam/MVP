import { Test, TestingModule } from '@nestjs/testing';
import { ApiAuthVimarController } from './api-auth-vimar.controller';

describe('ApiAuthVimarController', () => {
  let controller: ApiAuthVimarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiAuthVimarController],
    }).compile();

    controller = module.get<ApiAuthVimarController>(ApiAuthVimarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
