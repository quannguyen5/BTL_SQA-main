import { IsEmail, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  otp: string;
}
