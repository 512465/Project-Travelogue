import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { TravelogueModule } from './travelogue/travelogue.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AdminModule, AuthModule, TravelogueModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
