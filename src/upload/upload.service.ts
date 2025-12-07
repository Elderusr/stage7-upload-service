import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { S3Service } from '../s3/s3.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  constructor(
    private s3: S3Service,
    @InjectQueue('image-processing') private queue: Queue,
  ) {}

  private db = new Map<string, any>();

  async handleUpload(file: Express.Multer.File) {
    const id = randomUUID();

    const { key, url } = await this.s3.upload(file.buffer, file.mimetype);

    this.db.set(id, {
      id,
      originalUrl: url,
      status: 'pending',
      processedUrl: null,
      thumbnailUrl: null,
    });

    await this.queue.add('process-image', { id, key });

    return { id, originalUrl: url };
  }

  getStatus(id: string) {
    return this.db.get(id)?.status || 'not_found';
  }

  getResult(id: string) {
    return this.db.get(id) || { status: 'not_found' };
  }

  updateRecord(id: string, data: Partial<any>) {
    const existing = this.db.get(id);
    this.db.set(id, { ...existing, ...data });
  }
}
