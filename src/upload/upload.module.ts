import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadProcessor } from './upload.processor';
import { S3Module } from '../s3/s3.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [S3Module, QueueModule],
  controllers: [UploadController],
  providers: [UploadService, UploadProcessor],
})
export class UploadModule {}
