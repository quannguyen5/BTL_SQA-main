import { Module } from '@nestjs/common';
import { LoginModuleService } from './login-module.service';
import { LoginModuleController } from './login-module.controller';
import { User } from 'src/entities/user_entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [LoginModuleController],
  providers: [LoginModuleService],
})
export class LoginModuleModule {}
