export class UploadEntity {
  id: string;
  originalUrl: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  processedUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
}
