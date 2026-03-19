import { Test, TestingModule } from '@nestjs/testing';
import { WardsPlantsRelationshipsController } from './wards-plants-relationships.controller';

describe('WardsPlantsRelationshipsController', () => {
  let controller: WardsPlantsRelationshipsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WardsPlantsRelationshipsController],
    }).compile();

    controller = module.get<WardsPlantsRelationshipsController>(WardsPlantsRelationshipsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
