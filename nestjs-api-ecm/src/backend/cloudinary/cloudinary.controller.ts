import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from 'src/backend/cloudinary/cloudinary.service';
import { Multer } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('image')
@ApiTags('image')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 3))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async uploadImages(@UploadedFiles() files: Multer.File[]) {
    const uploadResults = await Promise.all(
      files.map((file) => this.cloudinaryService.uploadFile(file)),
    );
    return uploadResults.map((result) => result.secure_url); // Trả về danh sách URL của các file
  }
}
