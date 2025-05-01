import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { validateOrReject } from 'class-validator';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto) {
    if (createAdminDto.adminPassword !== createAdminDto.adminPasswordConfirm) {
      throw new BadRequestException('两次输入的密码不一致');
    }

    // 检查用户名是否已存在
    const existingAdmin = await this.adminRepository.findOne({
      where: { adminName: createAdminDto.adminName },
    });
    if (existingAdmin) {
      throw new BadRequestException('用户名已存在');
    }

    // 创建新的Admin
    const { adminPasswordConfirm, ...adminData } = createAdminDto; // 排除adminPasswordConfirm字段
    const newAdmin = this.adminRepository.create({
      ...adminData,
      adminAuth: 0,
      createdTime: new Date(),
    });

    if (!newAdmin) {
      throw new InternalServerErrorException('创建失败，请检查参数');
    }

    if (newAdmin.adminId === 1) {
      newAdmin.adminAuth = 1; // 管理员ID为1的用户为超级管理员，权限为1
    } else {
      newAdmin.adminAuth = 0; // 其他用户的权限为0
    }

    const data = await this.adminRepository.save(newAdmin);

    // 删除密码字段
    const { adminPassword, ...result } = data;
    const newData = result as AdminEntity;
    return newData; // 返回创建成功的Admin，不包括密码字段
  }

  findAll() {
    return `This action returns all admin`;
  }

  async findOne(identifier: string) {
    let admin: AdminEntity | null = null;
    const id =
      typeof identifier === 'number' ? identifier : parseInt(identifier); // 尝试解析为数字
    if (!isNaN(id)) {
      // 如果是数字，则按ID查询
      admin = await this.adminRepository.findOneBy({ adminId: id });
    }

    if (!admin && typeof identifier === 'string') {
      admin = await this.adminRepository.findOne({
        where: [{ adminName: identifier }],
      });
    }

    if (!admin) {
      throw new InternalServerErrorException(`未找到匹配${identifier}的记录`);
    }

    return admin;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const admin = await this.adminRepository.findOneBy({ adminId: id });
    if (!admin) {
      throw new InternalServerErrorException(`未找到匹配${id}的记录`);
    }

    // 合并更新数据
    Object.assign(admin, updateAdminDto);
    let newAdmin = await this.adminRepository.save(admin);

    const { adminPassword, ...result } = newAdmin; // 排除adminPassword字段
    const newData = result as AdminEntity;
    return newData;
  }

  async remove(id: number) {
    const admin = await this.adminRepository.findOneBy({ adminId: id });
    if (!admin) {
      throw new InternalServerErrorException(`未找到匹配${id}的记录`);
    }
    const result = await this.adminRepository.delete(id);
    return result;
  }
}
