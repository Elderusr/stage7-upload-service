import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private readonly client: S3Client;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_KEY;
    const secretAccessKey = process.env.S3_SECRET;
    const region = 'us-east-1'; // Or your desired region

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'S3_ENDPOINT, S3_KEY, and S3_SECRET must be provided in the environment variables.',
      );
    }

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async upload(buffer: Buffer, mime: string) {
    const bucket = process.env.S3_BUCKET;
    const publicBase = process.env.S3_PUBLIC_URL;
    const key = `uploads/${randomUUID()}.jpg`;

    if (!bucket || !publicBase) {
      throw new Error(
        'S3_BUCKET and S3_PUBLIC_URL must be provided in the environment variables.',
      );
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mime,
      }),
    );

    return { key, url: `${publicBase}/${key}` };
  }

  async get(key: string) {
    const bucket = process.env.S3_BUCKET;
    if (!bucket) {
      throw new Error(
        'S3_BUCKET must be provided in the environment variables.',
      );
    }

    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    const streamToBuffer = (stream) =>
      new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });

    return streamToBuffer(response.Body) as Promise<Buffer>;
  }
}
