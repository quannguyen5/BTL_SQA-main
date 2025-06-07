import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateSupplierDto {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  @IsEmail()
  url_image: string;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  @IsPhoneNumber('VN')
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  address: string;
}
