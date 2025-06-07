import { Module } from '@nestjs/common';
import { LogoutService } from './logout.service';
import { LogoutController } from './logout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user_entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [LogoutController],
  providers: [LogoutService],
})
export class LogoutModule {}
