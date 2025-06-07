import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateLocationUserDto {
    @ApiProperty()
    @IsNotEmpty()
    @Expose()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @Expose()
    address: string;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  @IsPhoneNumber('VN')
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  default_location: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  user_id: string;
}
