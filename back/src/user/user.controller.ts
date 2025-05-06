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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUserGuard } from 'src/auth-user/authUser.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    const data = await this.userService.findOne(identifier);
    const { userPassword, ...userInfo } = data; // 排除 userPassword 字段
    return userInfo;
  }

  // 更新头像
  @Patch('avatar')
  @UseGuards(AuthUserGuard)
  updateAvatar(@Body('userAvatar') userAvatar: string, @Request() req) {
    return this.userService.updateAvatar(req.user.sub, userAvatar);
  }

  @Patch(':id')
  @UseGuards(AuthUserGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthUserGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.userService.remove(+id);
  }
}
