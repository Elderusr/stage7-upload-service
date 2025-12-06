import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.handleUpload(file);
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.uploadService.getStatus(id);
  }

  @Get(':id/result')
  getResult(@Param('id') id: string) {
    return this.uploadService.getResult(id);
  }
}
