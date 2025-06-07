import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user_entity/user.entity';
import { RegisterModuleController } from 'src/backend/auth/register-module/register-module.controller';
import { RegisterModuleService } from 'src/backend/auth/register-module/register-service/register-module.service';
import { Location_userEntity } from 'src/entities/user_entity/location_user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Location_userEntity])],
  controllers: [RegisterModuleController],
  providers: [RegisterModuleService],
})
export class RegisterModuleModule {}
