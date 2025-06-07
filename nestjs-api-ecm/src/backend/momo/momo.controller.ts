import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { MomoService } from './momo.service';
import { ApiTags } from '@nestjs/swagger';
import { OrderService } from 'src/backend/order/order.service';
import { CreateMomoDto } from 'src/backend/momo/dto/create-momo.dto';
import { responseHandler } from 'src/Until/responseUtil';
import { UpdateOrderDTO } from 'src/dto/orderDTO/order.update.dto';
import { PaymentStatus } from 'src/share/Enum/Enum';

@Controller('momo')
@ApiTags('Payment')
export class MomoController {
  constructor(
    private readonly momoService: MomoService,
    private readonly orderService: OrderService,
  ) {}

  @Post('create-payment')
  async createPayment(@Body() body: CreateMomoDto) {
    try {
      // Tạo đơn hàng
      const order = await this.orderService.createOrder(body.order);

      // Tạo thanh toán sau khi tạo đơn hàng thành công
      const paymentResponse = await this.momoService.createPayment(
        body.amount,
        body.redirectUrl,
        body.ipnUrl,
        order.id,
        order.user_id,
      );

      // Trả về kết quả thành công
      return responseHandler.ok({
        order,
        payment: paymentResponse,
      });
    } catch (error) {
      // Xử lý lỗi, trả về thông báo lỗi chuẩn
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      return responseHandler.error(`Failed to create payment: ${errorMessage}`);
    }
  }

  @Post('callback-payment')
  async callbackPayment(@Body() payload: any) {
    try {
      console.log('vaof momo controller1', payload);
      // Gọi service xử lý callback
      // const result = await this.momoService.callbackPayment(payload);
      if (payload.resultCode !== 0) {
        console.log('111111');
        return responseHandler.error('Thanh toán chưa thành công!');
      } else {
        console.log('2222222');
        const update = new UpdateOrderDTO();
        update.user_id = payload.extraData;
        update.order_id = payload.orderId;
        update.paymentStatus = PaymentStatus.Paid;
        console.log('333333', update);
        const orderUpdate = this.orderService.updateOrder(update);
        console.log('553443434332', orderUpdate);
        if (!orderUpdate) {
          console.log('44444');
          return responseHandler.error('Lỗi khi update order');
        }
      }
      // Phản hồi thành công cho MoMo
      return 'success';
    } catch (error) {
      console.error('Error in handleMomoCallback:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      console.error('Error in handleMomoCallback:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
