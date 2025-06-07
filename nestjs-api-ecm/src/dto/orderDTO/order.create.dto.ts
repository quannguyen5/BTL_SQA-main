import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsInt,
  ValidateNested,
  IsPhoneNumber, IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod, PaymentStatus } from "src/share/Enum/Enum";

class ProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  product_id: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  quantity: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  priceout: number;
}

export class CreateOrderDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  totalPrice: number;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.CashOnDelivery, description: 'Phương thức thanh toán, chọn giữa "Thanh toán khi nhận hàng" hoặc "Chuyển khoản ngân hàng".', })
  paymentMethod: PaymentMethod = PaymentMethod.CashOnDelivery;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  location_id: string;

  @IsEnum(OrderStatus)
  @IsNotEmpty()
  @ApiProperty({ enum: OrderStatus, default: OrderStatus.Checking })
  orderStatus: OrderStatus = OrderStatus.Checking;

  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  @ApiProperty({ enum: PaymentStatus, default: PaymentStatus.Unpaid })
  paymentStatus: PaymentStatus = PaymentStatus.Unpaid;

  @IsArray()
  @ValidateNested({ each: true }) // Áp dụng xác thực cho từng phần tử trong mảng
  @Type(() => ProductDto) // Chuyển đổi từng phần tử thành ProductDto
  @IsNotEmpty()
  @ApiProperty({ type: ProductDto, isArray: true })
  products: ProductDto[];
}
