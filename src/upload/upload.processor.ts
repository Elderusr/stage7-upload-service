import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import sharp from 'sharp';
import { S3Service } from '../s3/s3.service';
import { UploadService } from './upload.service';

@Processor('image-processing')
export class UploadProcessor {
  constructor(
    private s3: S3Service,
    private uploadService: UploadService,
  ) {}

  @Process('process-image')
  async handle(job: Job<{ id: string; key: string }>) {
    const { id, key } = job.data;

    await this.uploadService.updateRecord(id, { status: 'processing' });

    const buffer = await this.s3.get(key);

    const processed = await sharp(buffer)
      .resize(1200)
      .jpeg({ quality: 80 })
      .toBuffer();

    const { url: processedUrl } = await this.s3.upload(
      processed,
      'image/jpeg',
    );

    const thumbnail = await sharp(buffer)
      .resize(300)
      .jpeg({ quality: 70 })
      .toBuffer();

    const { url: thumbnailUrl } = await this.s3.upload(
      thumbnail,
      'image/jpeg',
    );

    await this.uploadService.updateRecord(id, {
      status: 'done',
      processedUrl,
      thumbnailUrl,
    });
  }
}
