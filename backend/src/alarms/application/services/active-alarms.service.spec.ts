import { Test, TestingModule } from '@nestjs/testing';
import { ActiveAlarmsService } from './active-alarms.service';

describe('ActiveAlarmsService', () => {
  let service: ActiveAlarmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActiveAlarmsService],
    }).compile();

    service = module.get<ActiveAlarmsService>(ActiveAlarmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
