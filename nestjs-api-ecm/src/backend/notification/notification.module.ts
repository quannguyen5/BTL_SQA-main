import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
