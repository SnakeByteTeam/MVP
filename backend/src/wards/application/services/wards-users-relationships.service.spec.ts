import { Test, TestingModule } from '@nestjs/testing';
import { WardsUsersRelationshipsServiceService } from './wards-users-relationships.service';

describe('WardsUsersRelationshipsServiceService', () => {
  let service: WardsUsersRelationshipsServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WardsUsersRelationshipsServiceService],
    }).compile();

    service = module.get<WardsUsersRelationshipsServiceService>(WardsUsersRelationshipsServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
