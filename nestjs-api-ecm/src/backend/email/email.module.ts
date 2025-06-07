import { Module } from '@nestjs/common';
import {EmailService} from "src/backend/email/email.service";

@Module({
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
