import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class MomoService {
  private readonly partnerCode = 'MOMO';
  private readonly accessKey = 'F8BBA842ECF85';
  private readonly secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
  private readonly endpoint =
    'https://test-payment.momo.vn/v2/gateway/api/create';

  async createPayment(
    amount: number,
    redirectUrl: string,
    ipnUrl: string,
    orderId: string,
    user_id: string,
  ) {
    const requestId = orderId;
    const orderInfo = 'pay with MoMo';
    const extraData = user_id;
    const requestType = 'payWithMethod';
    const autoCapture = true;
    const lang = 'vi';

    // Tạo chữ ký HMAC SHA256
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    // Tạo payload gửi đến MoMo
    const requestBody = {
      partnerCode: this.partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount.toString(),
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: '',
      signature: signature,
    };

    try {
      const response = await axios.post(this.endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data; // Trả về kết quả từ MoMo
    } catch (error) {
      console.log(error);
      throw new Error('Failed to create MoMo payment');
    }
  }

  // async callbackPayment(payload: any) {
  //   // Bước 1: Xác minh chữ ký
  //   if (!this.verifySignature(payload)) {
  //     throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
  //   }

  //   // Bước 2: Xử lý thông tin giao dịch
  //   console.log('Verified Callback Payload:', payload);
  //   const orderId = payload.orderId;
  //   const resultCode = payload.resultCode;
  //   const message = payload.message;
  //   const user_id = payload.extraData;
  //   // TODO: Lưu trạng thái giao dịch vào database
  //   // Ví dụ: Gọi repository hoặc ORM để cập nhật trạng thái giao dịch
  //   // await this.transactionRepository.updateTransaction(payload.orderId, {
  //   //   status: 'SUCCESS',
  //   //   momoData: payload,
  //   // });

  //   // Bước 3: Bất kỳ logic bổ sung nào khác (nếu cần)
  //   return {
  //     orderId: orderId,
  //     resultCode: resultCode,
  //     message: message,
  //     user_id: user_id,
  //   };
  // }

  // private verifySignature(payload: any): boolean {
  //   // const { signature, ...data } = payload;
  //   const rawSignature = `accessKey=${payload.accessKey}&orderId=${payload.orderId}&partnerCode=${payload.partnerCode}&requestId=${payload.requestId}`;
  //   // const rawSignature = Object.keys(data)
  //   //   .sort()
  //   //   .map((key) => `${key}=${data[key]}`)
  //   //   .join('&');

  //   console.log(rawSignature);
  //   const generatedSignature = crypto
  //     .createHmac('sha256', this.secretKey)
  //     .update(rawSignature)
  //     .digest('hex');

  //   // return signature === generatedSignature;
  // }
}
