import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsNumber,
} from 'class-validator';

export class CreateTravelogueDto {
  @IsString({ message: 'travelogueTitle必须是字符串' })
  @IsNotEmpty({ message: 'travelogueTitle不能为空' })
  @Length(1, 100, { message: 'travelogueTitle长度必须在1到100个字符之间' })
  travelogueTitle: string;

  @IsNotEmpty({ message: 'travelogueContent不能为空' })
  travelogueContent: string;

  @IsString({ message: '封面链接必须是字符串' })
  @IsOptional()
  travelogueCover: string;
}
