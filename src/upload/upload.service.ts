import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    let url: string;

    try {
      const { key, url: uploadedUrl } = await this.s3.upload(
        file.buffer,
        file.mimetype,
      );
      url = uploadedUrl;
      this.db.set(id, {
        id,
        originalUrl: url,
        status: 'pending',
        processedUrl: null,
        thumbnailUrl: null,
      });
      await this.queue.add('process-image', { id, key });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload file and add to queue: ${error.message}`,
      );
    }
    return {
      statusCode: 201,
      message: 'File uploaded successfully',
      data: {
        id,
        originalUrl: url,
        status: 'pending',
      },
    };
  }
  getStatus(id: string) {
    const job = this.db.get(id);
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return {
      statusCode: 200,
      message: 'Job status retrieved successfully',
      data: {
        id: job.id,
        status: job.status,
      },
    };
  }
  getResult(id: string) {
    const job = this.db.get(id);
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }
  updateRecord(id: string, data: Partial<any>) {
    const existing = this.db.get(id);
    if (!existing) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    this.db.set(id, { ...existing, ...data });
  }
}
