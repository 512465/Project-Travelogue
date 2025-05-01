import { Injectable } from '@nestjs/common';
import { CreateTravelogueDto } from './dto/create-travelogue.dto';
import { UpdateTravelogueDto } from './dto/update-travelogue.dto';

@Injectable()
export class TravelogueService {
  create(createTravelogueDto: CreateTravelogueDto) {
    return 'This action adds a new travelogue';
  }

  findAll() {
    return `This action returns all travelogue`;
  }

  findOne(id: number) {
    return `This action returns a #${id} travelogue`;
  }

  update(id: number, updateTravelogueDto: UpdateTravelogueDto) {
    return `This action updates a #${id} travelogue`;
  }

  remove(id: number) {
    return `This action removes a #${id} travelogue`;
  }
}
