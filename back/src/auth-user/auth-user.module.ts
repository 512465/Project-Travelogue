import { Module } from '@nestjs/common';
import { AuthUserService } from './auth-user.service';
import { AuthUserController } from './auth-user.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true, // 全局模块，不需要在其他模块中导入
      secret: jwtConstants.secret, // 密钥
      signOptions: { expiresIn: '7d' }, // 过期时间
    }),
  ],
  controllers: [AuthUserController],
  providers: [AuthUserService],
})
export class AuthUserModule {}
