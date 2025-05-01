import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TravelogueService } from './travelogue.service';
import { CreateTravelogueDto } from './dto/create-travelogue.dto';
import { UpdateTravelogueDto } from './dto/update-travelogue.dto';

@Controller('travelogue')
export class TravelogueController {
  constructor(private readonly travelogueService: TravelogueService) {}

  @Post()
  create(@Body() createTravelogueDto: CreateTravelogueDto) {
    return this.travelogueService.create(createTravelogueDto);
  }

  @Get()
  findAll() {
    return this.travelogueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.travelogueService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTravelogueDto: UpdateTravelogueDto) {
    return this.travelogueService.update(+id, updateTravelogueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.travelogueService.remove(+id);
  }
}
