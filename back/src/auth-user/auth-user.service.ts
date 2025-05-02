import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthUserService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async singIn(userName: string, userPassword: string): Promise<any> {
    const user = await this.userService.findOne(userName);

    if (user?.userPassword !== userPassword) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, userName: user.userName };
    return {
      userId: user.userId,
      userAvatar: user.userAvatar,
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }
}
