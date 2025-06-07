import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {Email_entity} from "src/entities/helper/email_entity";
import { ConfigService } from '@nestjs/config';
import {Account, AccountNotify} from "src/Until/configConst";

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    constructor() {
        // Cấu hình Transporter
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',     // SMTP server (ví dụ Gmail)
            port: 587,                  // Cổng SMTP
            secure: false,              // Sử dụng TLS
            auth: {
                user: AccountNotify.USER, // Email gửi
                pass: AccountNotify.PASS, // Mật khẩu email (hoặc App Password)
            },
        });
    }

    async sendNotificationEmail(emailEntities: Email_entity[]): Promise<void> {
        if (emailEntities.length === 0) {
            console.log('No offline admins to send email notifications.');
            return;
        }

        try {
            for (const email of emailEntities) {
                await this.transporter.sendMail({
                    from: '"Admin" <vuong2k2002@gmail.com>',             // Tên người gửi
                    to: email.emailReceive,                              // Email người nhận
                    subject: email.header,                               // Tiêu đề email
                    text: email.content,                                 // Nội dung dạng text
                    html: email.htmlContent,                             // Nội dung dạng HTML
                });
                console.log(`Email sent to ${email.emailReceive}`);
            }
        } catch (error) {
            console.error('Failed to send email:', error);
            throw new Error('Email sending failed');
        }
    }

}
