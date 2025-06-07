import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsInt,
  ValidateNested,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  ApplyStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from 'src/share/Enum/Enum';

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

export class UpdateOrderDTO {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  order_id: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ enum: OrderStatus })
  orderStatus: OrderStatus;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  user_id: string;

  @IsString()
  @ApiProperty()
  employee_id: string;

  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  @ApiProperty({ enum: PaymentStatus, default: PaymentStatus.Paid })
  paymentStatus: PaymentStatus = PaymentStatus.Paid;
}
