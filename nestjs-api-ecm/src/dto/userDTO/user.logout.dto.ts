import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class logoutDTO {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  token: string;
}
