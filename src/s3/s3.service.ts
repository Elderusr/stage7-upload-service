import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private readonly client: S3Client;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT!;
    const accessKeyId = process.env.S3_KEY!;
    const secretAccessKey = process.env.S3_SECRET!;
    const region = 'us-east-1';

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
    const bucket = process.env.S3_BUCKET!;
    const publicBase = process.env.S3_PUBLIC_URL!;
    const filename = `uploads/${randomUUID()}.jpg`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: buffer,
        ContentType: mime,
      }),
    );

    return `${publicBase}/${filename}`;
  }
}
