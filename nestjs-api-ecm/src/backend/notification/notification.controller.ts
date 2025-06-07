import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {responseHandler} from "src/Until/responseUtil";

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
}
