import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
import { QueueModule } from './queue/queue.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [QueueModule, S3Module, UploadModule],
})
export class AppModule {}
