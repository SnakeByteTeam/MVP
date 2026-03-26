import { Test, TestingModule } from '@nestjs/testing';
import { WardsUsersRelationshipsService } from './wards-users-relationships.service';

describe('WardsUsersRelationshipsServiceService', () => {
  let service: WardsUsersRelationshipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WardsUsersRelationshipsService],
    }).compile();

    service = module.get<WardsUsersRelationshipsService>(
      WardsUsersRelationshipsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
