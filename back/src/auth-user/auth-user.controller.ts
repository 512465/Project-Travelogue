import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthUserService } from './auth-user.service';
import { CreateAuthUserDto } from './dto/create-auth-user.dto';
import { AuthUserGuard } from './authUser.guard';

@Controller('auth-user')
export class AuthUserController {
  constructor(private readonly authUserService: AuthUserService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  singIn(@Body() createAuthUserDto: CreateAuthUserDto) {
    return this.authUserService.singIn(
      createAuthUserDto.userName,
      createAuthUserDto.userPassword,
    );
  }

  @UseGuards(AuthUserGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
