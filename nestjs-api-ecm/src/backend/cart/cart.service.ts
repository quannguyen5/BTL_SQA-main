import { Injectable } from '@nestjs/common';
import { CreateCartDto } from '../../dto/cart_product/create-cart.dto';
import { UpdateCartDto } from '../../dto/cart_product/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CartRepository } from 'src/repository/CartRepository';
import { Cart_productEntity } from 'src/entities/cartproduct_entity/cart_product.entity';
import { BaseService } from 'src/base/baseService/base.service';
import any = jasmine.any;
import {In} from "typeorm";

@Injectable()
export class CartService extends BaseService<Cart_productEntity> {
  constructor(
    @InjectRepository(Cart_productEntity)
    private readonly cartRepo: CartRepository,
  ) {
    super(cartRepo);
  }

  async getList(page: number = 1, limit: number = 10) {
    if (page < 1) {
      throw new Error('PAGE NUMBER MUST BE GREATER THAN 0!');
    }

    if (limit < 1) {
      throw new Error('LIMIT MUST BE GREATER THAN 0!');
    }

    const [list, total] = await this.cartRepo.findAndCount({
      /*where: condition,*/
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!list) throw new Error('NO cart!');

    return {
      data: list,
      total,
      page,
      limit,
    };
  }

  async getListProduct(filters: any) {
    const condition: any = {};
    if (filters.user_id) condition.user_id = filters.user_id;
    const [list, total] = await this.cartRepo.findAndCount({
      where: condition,
      relations: ['product'],
    });
    if (!list) throw new Error('No product!');
    return {
      cart: list,
      total,
    };
  }

  async create(createCart: CreateCartDto) {
    const condition: any = {
      product_id: createCart.product_id,
      user_id: createCart.user_id,
    };
    const productInDB = await this.cartRepo.findOneBy(condition);
    if (productInDB != null) {
      productInDB.quantity = createCart.quantity;
      return await super.update(productInDB, productInDB.id);
    }
    return await super.create(createCart, condition);
  }

  async detail(filters: any) {
    const condition: any = {};
    if (filters.user_id) condition.user_id = filters.user_id;
    if (filters.product_id) condition.product_id = filters.product_id;
    return await this.cartRepo.findOneBy(condition);
  }

  async update(cartUpdateDTO: UpdateCartDto, id: string) {
    return await super.update(cartUpdateDTO, id);
  }

  async deleteProductsInCart(user_id: string, cart_ids: string[]) {
    if (!cart_ids || cart_ids.length === 0) {
      throw new Error('cart_ids cannot be empty');
    }
    try {
      const result = await this.cartRepo.delete({
        id: In(cart_ids),
        user_id: user_id, // Kiểm tra user_id
      });
      if (result.affected === 0) {
        throw new Error('No records were deleted. Check cart_ids.');
      }
      return result;
    } catch (error) {
      throw new Error(`Failed to delete products in cart`);
    }
  }
}
