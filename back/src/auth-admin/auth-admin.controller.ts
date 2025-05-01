import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthAdminService } from './auth-admin.service';
import { AuthAdminGuard } from './authAdmin.guard';
import { CreateAuthAdminDto } from './dto/create.auth.admin.dto';

@Controller('auth-admin')
export class AuthAdminController {
  constructor(private readonly authAdminService: AuthAdminService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  singIn(@Body() AdminDto: CreateAuthAdminDto) {
    return this.authAdminService.singIn(
      AdminDto.adminName,
      AdminDto.adminPassword,
    );
  }
  @UseGuards(AuthAdminGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
