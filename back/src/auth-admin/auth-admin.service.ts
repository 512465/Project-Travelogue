import { AdminService } from 'src/admin/admin.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthAdminService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  async singIn(adminName: string, adminPassword: string): Promise<any> {
    const admin = await this.adminService.findOne(adminName);

    // 验证密码是否匹配
    if (admin?.adminPassword !== adminPassword) {
      throw new UnauthorizedException();
    }

    const payload = { adminName: admin.adminName, sub: admin.adminId };

    return {
      adminId: admin.adminId,
      adminName: admin.adminName,
      adminAuth: admin.adminAuth,
      createdTime: admin.createdTime,
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }
}
