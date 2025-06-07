import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCartDto } from './create-cart.dto';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateCartDto extends PartialType(CreateCartDto) {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  id: string;
}
