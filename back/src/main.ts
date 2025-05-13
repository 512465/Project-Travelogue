import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');

    // 配置CORS
    app.enableCors({
      origin: '*', // 允许所有来源
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 允许的HTTP方法
      credentials: true, // 允许携带凭证（如cookies）
      allowedHeaders: 'Content-Type,Authorization', // 允许的头部字段
      exposedHeaders: 'Content-Type,Authorization', // 暴露的头部字段
      maxAge: 3600, // 预检请求的缓存时间，单位为秒
    });
    await app.listen(3000);
  } catch (error) {
    console.error('应用启动失败:', error);
    process.exit(1);
  }
}
bootstrap();
