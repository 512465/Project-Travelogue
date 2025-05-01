import { Test, TestingModule } from '@nestjs/testing';
import { TravelogueController } from './travelogue.controller';
import { TravelogueService } from './travelogue.service';

describe('TravelogueController', () => {
  let controller: TravelogueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TravelogueController],
      providers: [TravelogueService],
    }).compile();

    controller = module.get<TravelogueController>(TravelogueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
