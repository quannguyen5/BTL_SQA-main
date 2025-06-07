import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderAllOrderDto {
  @IsNotEmpty()
  @ApiProperty()
  page: number;

  @IsNotEmpty()
  @ApiProperty()
  limit: number;
}
