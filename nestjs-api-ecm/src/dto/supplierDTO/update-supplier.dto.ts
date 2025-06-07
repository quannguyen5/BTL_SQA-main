import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSupplierDto } from './create-supplier.dto';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  id: string;
}
