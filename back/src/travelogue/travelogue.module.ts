import { Module } from '@nestjs/common';
import { TravelogueService } from './travelogue.service';
import { TravelogueController } from './travelogue.controller';

@Module({
  controllers: [TravelogueController],
  providers: [TravelogueService],
})
export class TravelogueModule {}
