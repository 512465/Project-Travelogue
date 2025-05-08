import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { validateOrReject } from 'class-validator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    if (createUserDto.userPassword !== createUserDto.userPasswordConfirm) {
      throw new BadRequestException('两次输入的密码不一致');
    }

    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { userName: createUserDto.userName },
    });
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    // 创建新用户
    const { userPasswordConfirm, ...userData } = createUserDto; // 排除 userPasswordConfirm 字段
    const newUser = this.userRepository.create({
      ...userData,
      createdTime: new Date(), // 设置创建时间为当前时间
    });

    if (!newUser) {
      throw new InternalServerErrorException('创建用户失败,请检查参数');
    }

    const data = await this.userRepository.save(newUser);

    // 返回用户信息，不包含密码
    const { userPassword, ...userInfo } = data;
    const newUserInfo = userInfo as UserEntity;
    return newUserInfo;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(identifier: string) {
    let user: UserEntity | null = null;
    const id =
      typeof identifier === 'number' ? identifier : parseInt(identifier); // 尝试解析为数字
    if (!isNaN(id)) {
      // 如果是数字，查找用户ID
      user = await this.userRepository.findOneBy({ userId: id });
    }
    if (!user && typeof identifier === 'string') {
      user = await this.userRepository.findOne({
        where: { userName: identifier },
      });
    }
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ userId: id });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    Object.assign(user, updateUserDto); // 更新用户信息
    let newUser = await this.userRepository.save(user);
    const { userPassword, ...result } = newUser;
    const newData = result as UserEntity;
    return newData;
  }

  async updateAvatar(id: number, userAvatar: string) {
    const user = await this.userRepository.findOneBy({ userId: id });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    const newUserData = {
      ...user,
      userAvatar: userAvatar,
    };
    const newUser = await this.userRepository.save(newUserData);
    const { userPassword, ...result } = newUser;
    const newData = result;
    const newAvatar = newData.userAvatar;
    return { newData, newAvatar };
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ userId: id });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    const result = await this.userRepository.delete(id); // 删除用户
    return result;
  }
}
