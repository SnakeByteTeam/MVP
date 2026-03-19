import { Test, TestingModule } from '@nestjs/testing';
import { WardsPlantsRelationshipsService } from './wards-plants-relationships.service';

describe('WardsPlantsRelationshipsService', () => {
  let service: WardsPlantsRelationshipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WardsPlantsRelationshipsService],
    }).compile();

    service = module.get<WardsPlantsRelationshipsService>(WardsPlantsRelationshipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
