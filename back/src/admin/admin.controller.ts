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
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AuthAdminGuard } from '../auth-admin/authAdmin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    const data = await this.adminService.findOne(identifier);
    const { adminPassword, ...result } = data;
    return result; // 返回创建成功的Admin，不包括密码字段
  }

  @Patch(':id')
  @UseGuards(AuthAdminGuard)
  update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @Request() req,
  ) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  @UseGuards(AuthAdminGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.adminService.remove(+id);
  }
}
