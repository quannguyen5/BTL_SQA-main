import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApplyStatus } from 'src/share/Enum/Enum';

export class CategoryCreateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  url_image: string;
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  banner: string;
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  description: string;

  @ApiProperty({ enum: ApplyStatus })
  @IsNotEmpty()
  @Expose()
  status: ApplyStatus;
}
