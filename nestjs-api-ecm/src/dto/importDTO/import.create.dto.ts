import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ProductDTO {
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
  price_in: number;
}

export class CreateImportDTO {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  totalAmount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  import_code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  user_id: string;

  @IsArray()
  @ValidateNested({ each: true }) // Áp dụng xác thực cho từng phần tử trong mảng

  @Type(() => ProductDTO) // Chuyển đổi từng phần tử thành ProductDto
  @IsNotEmpty()
  @ApiProperty({ type: ProductDTO, isArray: true })
  products: ProductDTO[];
}
