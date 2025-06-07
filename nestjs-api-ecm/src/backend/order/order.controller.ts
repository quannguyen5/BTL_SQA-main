import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { OrderService } from 'src/backend/order/order.service';
import { CreateOrderDto } from 'src/dto/orderDTO/order.create.dto';
import { responseHandler } from 'src/Until/responseUtil';
import { Roles } from 'src/decorator/Role.decorator';
import { OrderAllOrderDto } from 'src/dto/orderDTO/order.allOrder.dto';
import { UpdateOrderDTO } from 'src/dto/orderDTO/order.update.dto';
import {
  ExpirationStatus,
  OrderStatus,
  PaymentStatus,
} from 'src/share/Enum/Enum';
import {ParseBooleanPipe} from "src/share/ParseBooleanPipe";

@Controller('order')
@ApiTags('Order')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly order_Service: OrderService) {}

  @Post('all-user-order/:user_id')
  @Roles('user')
  async getAllOrder(
    @Param('user_id') user_id: string,
    @Body() allOderDTO: OrderAllOrderDto,
  ) {
    try {
      const allOrder = await this.order_Service.getAllOrder(
        user_id,
        allOderDTO,
      );
      return responseHandler.ok(allOrder);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @ApiQuery({
    name: 'orderStatus',
    enum: OrderStatus,
    required: false,
    description:
      'Trạng thái đơn hàng (All, Checking, InTransit, Delivered, Canceled)',
  })
  @ApiQuery({
    name: 'paymentStatus',
    enum: PaymentStatus,
    required: false,
    description: 'Trạng thái thanh toán (All, Paid, Unpaid, Debt)',
  })
  @ApiQuery({
    name: 'includeExcluded',
    type: Boolean,
    required: false,
    description:
        'Lấy Delivered và Canceled nếu là true, ngược lại loại trừ chúng (default: false)',
  })
  @Get('manage-order/:page/:limit')
  @Roles('admin')
  async getOrderManagement(
      @Param('page') page: number,
      @Param('limit') limit: number,
      @Query('orderStatus') orderStatus?: OrderStatus,
      @Query('paymentStatus') paymentStatus?: PaymentStatus,
      @Query('includeExcluded', ParseBooleanPipe) includeExcluded?: boolean,
  ) {
    try {
      const excludedStatuses = [OrderStatus.Delivered, OrderStatus.Canceled];
      const filters = {
        orderStatus: orderStatus || '',
        paymentStatus: paymentStatus || '',
        includedStatuses: includeExcluded && !orderStatus ? excludedStatuses : [],
        excludedStatuses: includeExcluded == false && !orderStatus ? excludedStatuses : [],
      };

      const allOrder = await this.order_Service.getOrderManagement(
          page,
          limit,
          filters,
      );
      return responseHandler.ok(allOrder);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Post(':user_id')
  @Roles('user')
  async createOrder(
    @Param('user_id') user_id: string,
    @Body() oderDTO: CreateOrderDto,
  ) {
    try {
      const order = await this.order_Service.createOrder(oderDTO);
      return responseHandler.ok(order);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Get('detail/:user_id/:id')
  @Roles('user', 'admin')
  async getDetailOrder(@Param('user_id') user_id: string, @Param('id') id: string) {
    try {
      const orderDetail = await this.order_Service.getDetail(id);
      return responseHandler.ok(orderDetail);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Patch(':user_id')
  @Roles('user', 'admin', 'employee')
  async updateOrder(@Param('user_id') user_id: string, @Body() updateOrderDTO: UpdateOrderDTO) {
    try {
      const orderUpdate = await this.order_Service.updateOrder(updateOrderDTO);
      return responseHandler.ok(orderUpdate);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }

  @Get('order-user-dashboard/:user_id')
  @Roles('user', 'admin')
  async getOrderUserDashboard(@Param('user_id') user_id: string) {
    try {
      const orderUserDashBoard = await this.order_Service.getOrderUserDashboard(user_id);
      return responseHandler.ok(orderUserDashBoard);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      return responseHandler.error(errorMessage);
    }
  }
}
