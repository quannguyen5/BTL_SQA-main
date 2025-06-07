import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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

export class UpdateImpotyDTO {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  totalAmount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  import_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  import_code: string;

  @IsArray()
  @ValidateNested({ each: true }) // Áp dụng xác thực cho từng phần tử trong mảng
  @Type(() => ProductDTO) // Chuyển đổi từng phần tử thành ProductDto
  @IsNotEmpty()
  @ApiProperty({ type: ProductDTO, isArray: true })
  products: ProductDTO[];
}
