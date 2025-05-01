import { Test, TestingModule } from '@nestjs/testing';
import { TravelogueService } from './travelogue.service';

describe('TravelogueService', () => {
  let service: TravelogueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TravelogueService],
    }).compile();

    service = module.get<TravelogueService>(TravelogueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
