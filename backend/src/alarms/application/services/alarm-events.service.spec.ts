import { Test, TestingModule } from '@nestjs/testing';
import { AlarmEventsService } from './alarm-events.service';

describe('AlarmEventsService', () => {
  let service: AlarmEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlarmEventsService],
    }).compile();

    service = module.get<AlarmEventsService>(AlarmEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
