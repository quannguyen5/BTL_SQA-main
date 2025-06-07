import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLocationUserDto } from './create-location_user.dto';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdateLocationUserDto extends PartialType(CreateLocationUserDto) {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  id: string;

  
}
