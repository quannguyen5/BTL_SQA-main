import { Injectable } from '@nestjs/common';
import { OrderEntity } from 'src/entities/order_entity/oder.entity';
import { NotificationStatus, NotificationType } from 'src/share/Enum/Enum';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config();

@Injectable()
export class NotificationService {
  constructor() {
    if (!admin.apps.length) {
      const serviceAccountPath = path.resolve(
        process.cwd(),
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH!,
      );
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_SERVICE_DATABASE,
      });
    }
  }

  async sendNotification(
    order: OrderEntity,
    message: string,
    status: NotificationStatus.Success,
    notificationType: NotificationType,
  ): Promise<void> {
    const db = admin.database();
    const notificationsRef = db.ref('notificationAdmins');
    const newNotification = {
      order_id: order.id,
      isRead: false,
      message,
      createdAt: order.createdAt.toISOString(),
      status: status,
      notificationType: notificationType,
    };
    await notificationsRef.push(newNotification);
  }
}
