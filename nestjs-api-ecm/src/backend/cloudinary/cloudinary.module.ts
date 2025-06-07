import { Module } from '@nestjs/common';
import { CloudinaryService } from 'src/backend/cloudinary/cloudinary.service';
import { CloudinaryProvider } from 'src/backend/cloudinary/cloudinary.provider';
import { CloudinaryController } from 'src/backend/cloudinary/cloudinary.controller';

@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService, CloudinaryProvider],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
