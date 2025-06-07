import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CategoryCreateDTO } from 'src/dto/categoryDTO/category.create.dto';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class categoryUpdateDTO extends PartialType(CategoryCreateDTO) {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  id: string;
}
