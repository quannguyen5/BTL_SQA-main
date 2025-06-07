import { ApiProperty } from '@nestjs/swagger';
import {IsDate, IsNotEmpty} from 'class-validator';
import {Expose, Type} from 'class-transformer';
import {ExpirationStatus} from "src/share/Enum/Enum";

export class ProductCreateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  priceout: number;
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  banner: string;
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  stockQuantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  weight: number;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  url_image: string;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  category_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  supplier_id: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @Expose()
  expire_date: Date;
}
