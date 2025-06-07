import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderDto } from 'src/dto/orderDTO/order.create.dto';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMomoDto {
  @ApiProperty({
    description: 'Thông tin đơn hàng',
    type: CreateOrderDto, // Đính kèm DTO của order
  })
  @ValidateNested() // Xác thực đối tượng lồng nhau
  @Type(() => CreateOrderDto) // Chuyển đổi thành kiểu CreateOrderDto
  order: CreateOrderDto;

  @ApiProperty({
    description: 'Số tiền cần thanh toán',
    example: 100000,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'URL chuyển hướng sau khi thanh toán thành công',
    example: 'https://example.com/success',
  })
  @IsString()
  @IsNotEmpty()
  redirectUrl: string;

  @ApiProperty({
    description: 'URL thông báo trạng thái thanh toán',
    example: 'https://example.com/ipn',
  })
  @IsString()
  @IsNotEmpty()
  ipnUrl: string;
}
