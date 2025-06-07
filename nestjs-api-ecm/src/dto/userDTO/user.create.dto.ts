import { IsEmail, IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  firstName: string;
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  lastName: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  @Expose()
  phone: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 24)
  password: string;
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  address: string;
  @ApiProperty()
  @Expose()
  url_image: string;
  active: boolean;
  @Expose()
  role: string;
}
