import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TravelogueService } from './travelogue.service';
import { CreateTravelogueDto } from './dto/create-travelogue.dto';
import { UpdateTravelogueDto } from './dto/update-travelogue.dto';
import { AuthUserGuard } from 'src/auth-user/authUser.guard';

@Controller('travelogue')
export class TravelogueController {
  constructor(private readonly travelogueService: TravelogueService) {}

  @Post()
  @UseGuards(AuthUserGuard)
  create(@Body() createTravelogueDto: CreateTravelogueDto, @Request() req) {
    return this.travelogueService.create(
      createTravelogueDto,
      req.user.sub,
      req.user.userName,
    );
  }

  @Get()
  @UseGuards(AuthUserGuard)
  findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('travelogueStatus') travelogueStatus?: number,
  ) {
    return this.travelogueService.findAll(req.user.sub, {
      page,
      limit,
      travelogueStatus,
    });
  }

  @Get('list')
  findAllList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('travelogueStatus') travelogueStatus?: number,
    @Query('travelogueTitle') travelogueTitle?: string,
    @Query('travelogueAuthor') travelogueAuthor?: string,
  ) {
    return this.travelogueService.findAllList({
      page,
      limit,
      travelogueStatus,
      travelogueTitle,
      travelogueAuthor,
    });
  }

  @Get(':id')
  @UseGuards(AuthUserGuard)
  findOne(@Param('id') id: string) {
    return this.travelogueService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthUserGuard)
  update(
    @Param('id') id: string,
    @Body() updateTravelogueDto: UpdateTravelogueDto,
    @Request() req,
  ) {
    return this.travelogueService.update(
      +id,
      updateTravelogueDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  @UseGuards(AuthUserGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.travelogueService.remove(+id, req.user.sub);
  }
}
