import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ProductCreateDTO } from 'src/dto/productDTO/product.create.dto';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class ProductUpdateDTO extends PartialType(ProductCreateDTO) {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  id: string;
}
