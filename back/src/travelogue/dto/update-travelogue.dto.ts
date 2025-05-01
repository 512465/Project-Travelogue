import { PartialType } from '@nestjs/mapped-types';
import { CreateTravelogueDto } from './create-travelogue.dto';

export class UpdateTravelogueDto extends PartialType(CreateTravelogueDto) {}
