import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from 'src/decorator/match.decorator';

export class changePassDTO {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  password: string;
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  @Match('newPassword', { message: 'newPasswordCf must match newPassword' })
  newPasswordCf: string;
}
