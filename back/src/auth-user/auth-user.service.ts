import { Injectable } from '@nestjs/common';
import { CreateAuthUserDto } from './dto/create-auth-user.dto';
import { UpdateAuthUserDto } from './dto/update-auth-user.dto';

@Injectable()
export class AuthUserService {
  create(createAuthUserDto: CreateAuthUserDto) {
    return 'This action adds a new authUser';
  }

  findAll() {
    return `This action returns all authUser`;
  }

  findOne(id: number) {
    return `This action returns a #${id} authUser`;
  }

  update(id: number, updateAuthUserDto: UpdateAuthUserDto) {
    return `This action updates a #${id} authUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} authUser`;
  }
}
