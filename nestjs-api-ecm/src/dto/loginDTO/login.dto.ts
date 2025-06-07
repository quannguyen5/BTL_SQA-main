import { IsEmail, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  password: string;
}
