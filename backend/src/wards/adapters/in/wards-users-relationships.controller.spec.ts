import { Test, TestingModule } from '@nestjs/testing';
import { WardsUsersRelationshipsController } from './wards-users-relationships.controller';

describe('WardsUsersRelationshipsController', () => {
  let controller: WardsUsersRelationshipsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WardsUsersRelationshipsController],
    }).compile();

    controller = module.get<WardsUsersRelationshipsController>(WardsUsersRelationshipsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
