import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from 'src/backend/cloudinary/cloudinary-response';
import * as streamifier from 'streamifier';
import { Multer } from 'multer';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // Tự động nhận diện loại file (hình ảnh hoặc video)
          quality: 'auto', // Tự động tối ưu hóa chất lượng
          transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Thay đổi kích thước hình ảnh nếu cần
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      // Tạo stream từ buffer của file và pipe vào uploadStream
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
