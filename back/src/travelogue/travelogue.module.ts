import { Module } from '@nestjs/common';
import { TravelogueService } from './travelogue.service';
import { TravelogueController } from './travelogue.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelogueEntity } from './entities/travelogue.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { AdminEntity } from 'src/admin/entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TravelogueEntity, UserEntity, AdminEntity]),
  ],
  controllers: [TravelogueController],
  providers: [TravelogueService],
})
export class TravelogueModule {}
