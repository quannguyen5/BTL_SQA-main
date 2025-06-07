import { Module } from '@nestjs/common';
import { ChangePasswordService } from './change-password.service';
import { ChangePasswordController } from './change-password.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user_entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ChangePasswordController],
  providers: [ChangePasswordService],
})
export class ChangePasswordModule {}
