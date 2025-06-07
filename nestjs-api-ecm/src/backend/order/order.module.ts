import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/entities/order_entity/oder.entity';
import { Order_productEntity } from 'src/entities/order_entity/order_product.entity';
import { UserRepository } from 'src/repository/UserRepository';
import { User } from 'src/entities/user_entity/user.entity';
import { NotificationService } from 'src/backend/notification/notification.service';
import { EmailService } from 'src/backend/email/email.service';
import { CartRepository } from 'src/repository/CartRepository';
import { Cart_productEntity } from 'src/entities/cartproduct_entity/cart_product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      User,
      Order_productEntity,
      Cart_productEntity,
    ]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    NotificationService,
    UserRepository,
    EmailService,
    NotificationService,
    CartRepository,
  ],
  exports: [OrderService],
})
export class OrderModule {}
