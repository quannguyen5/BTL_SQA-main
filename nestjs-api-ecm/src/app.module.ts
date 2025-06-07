import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BackendModule } from './backend/backend.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user_entity/user.entity';
import { CategoryEntity } from './entities/category_entity/category.entity';
import { JwtModule } from '@nestjs/jwt';
import { ProductEntity } from 'src/entities/product_entity/product.entity';
import { Cart_productEntity } from 'src/entities/cartproduct_entity/cart_product.entity';
import { Import_productEntity } from 'src/entities/import_entity/import_product.entity';
import { ImportEntity } from 'src/entities/import_entity/import.entity';
import { SupplierEntity } from 'src/entities/supplier_entity/supplier.entity';
import { OrderEntity } from 'src/entities/order_entity/oder.entity';
import { Location_userEntity } from 'src/entities/user_entity/location_user.entity';
import { UserModule } from 'src/backend/user/user.module';
import { Order_productEntity } from 'src/entities/order_entity/order_product.entity';
import { EmailModule } from './backend/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('TOKEN_EXPIRE') },
      }),
    }),
    BackendModule,
    UserModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('MYSQL_HOST'),
        port: configService.get<number>('MYSQL_PORT'),
        username: configService.get<string>('MYSQL_USER'),
        password: configService.get<string>('MYSQL_PASS'),
        database: configService.get<string>('MYSQL_DBNAME'),
        entities: [
          User,
          CategoryEntity,
          ProductEntity,
          Order_productEntity,
          Cart_productEntity,
          Import_productEntity,
          ImportEntity,
          SupplierEntity,
          OrderEntity,
          Location_userEntity,
        ],
        synchronize: true,
        logging: true,
      }),
    }),
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
