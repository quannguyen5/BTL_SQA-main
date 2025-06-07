import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import {UserModule} from "src/backend/user/user.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {CategoryEntity} from "src/entities/category_entity/category.entity";
import {ProductEntity} from "src/entities/product_entity/product.entity";
import {Cart_productEntity} from "src/entities/cartproduct_entity/cart_product.entity";
import {LocationUserService} from "src/backend/location_user/location_user.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart_productEntity]),
  ],
  exports: [CartService],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}