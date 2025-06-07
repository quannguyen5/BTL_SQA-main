import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { Roles } from 'src/decorator/Role.decorator';
import { responseHandler } from 'src/Until/responseUtil';
import { CartService } from 'src/backend/cart/cart.service';
import { CreateCartDto } from 'src/dto/cart_product/create-cart.dto';
import { UpdateCartDto } from 'src/dto/cart_product/update-cart.dto';
import {DeleteCartDto} from "src/dto/cart_product/delete-cart.dto";

@Controller('cart')
@ApiTags('Cart')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('list/:page/:limit')
  @Roles('admin')
  async getListCart(
    @Param('page') page: number,
    @Param('limit') limit: number,
  ) {
    try {
      const listCart = await this.cartService.getList(page, limit);
      return responseHandler.ok(listCart);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Post('add-to-cart/:user_id')
  @Roles('user')
  async addToCart(
    @Param('user_id') user_id: string,
    @Body() createCartDto: CreateCartDto,
  ) {
    try {
      const addToCart = await this.cartService.create(createCartDto);
      return responseHandler.ok(addToCart);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Get('all-product/:user_id')
  @Roles('user')
  async getAllProductInCart(@Param('user_id') user_id: string) {
    try {
      const filters = {
        user_id: user_id,
      };
      const allProduct = await this.cartService.getListProduct(filters);
      return responseHandler.ok(allProduct);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Patch(':user_id')
  @Roles('user')
  async update(@Body() updateCartDto: UpdateCartDto) {
    try {
      const productUpdate = await this.cartService.update(
        updateCartDto,
        updateCartDto.id,
      );
      return responseHandler.ok(productUpdate);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Delete(':user_id')
  @Roles('user')
  async delete(
      @Param('user_id') user_id: string,
      @Body() updateCartDto: DeleteCartDto) {
    try {
      const check = await this.cartService.deleteProductsInCart(user_id, updateCartDto.cart_ids);
      return responseHandler.ok(check);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }
}
