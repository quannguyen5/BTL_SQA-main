import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true, // Cho phép mọi nguồn truy cập
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP cho phép
    credentials: true, // Hỗ trợ gửi cookie nếu cần
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const config = new DocumentBuilder()
    .setTitle('Shop Ecommerce')
    .setDescription('API for Shop Ecommerce')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Ecommerce')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
}
bootstrap();
