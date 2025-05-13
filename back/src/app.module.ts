import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { TravelogueModule } from './travelogue/travelogue.module';
import { UserModule } from './user/user.module';
// 数据库配置
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthAdminModule } from './auth-admin/auth-admin.module';
import { AuthUserModule } from './auth-user/auth-user.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', // 数据库类型
      host: '43.131.235.203', // 数据库地址
      port: 3306, // 数据库端口
      username: 'project', // 数据库用户名
      password: '3KHwP2ddYENkn4pJ', // 数据库密码
      database: 'project', // 数据库名称
      synchronize: true, // 是否自动创建数据库表
      retryDelay: 500, // 重试间隔时间
      retryAttempts: 10, // 重试次数
      autoLoadEntities: true, // 自动加载实体,
    }),
    AdminModule,
    TravelogueModule,
    UserModule,
    AuthAdminModule,
    AuthUserModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
