import { Module } from '@nestjs/common';
import { MomoService } from './momo.service';
import { MomoController } from './momo.controller';
import {OrderModule} from "src/backend/order/order.module";

@Module({
  imports: [OrderModule], // Thêm OrderModule vào imports
  controllers: [MomoController],
  providers: [MomoService],
})
export class MomoModule {}
