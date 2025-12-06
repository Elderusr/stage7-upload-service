Here’s a professional, clear, and complete README for your **NestJS File Upload + MinIO + BullMQ Image Processing** project. You can drop it as `README.md` in your repo.

---

# File Upload & Async Image Processing Service

A NestJS backend service for uploading images, processing them asynchronously, storing in **MinIO**, and serving via **presigned URLs**. Background processing uses **BullMQ + Redis** for resizing and thumbnail generation.

---

## Features

* Upload images via `POST /upload` (multipart/form-data).
* Async image processing (resize / thumbnail) with BullMQ.
* Store images in MinIO (S3-compatible storage).
* Serve images securely through presigned URLs at `GET /files/:key`.
* Fully containerized with Docker (MinIO + Redis).
* TypeScript, NestJS, and AWS SDK v3 ready.

---

## Requirements

* Node.js ≥ 18
* Docker & Docker Compose
* npm

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/file-upload-service.git
cd file-upload-service
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```env
# App
PORT=3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO / S3
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=uploads
S3_KEY=minio
S3_SECRET=minio123

# Public URL served through NestJS
PUBLIC_FILE_URL=http://localhost:3000/files
```

---

## Running the Service

### 1. Start Docker services

```bash
docker-compose up -d
```

* Redis: `localhost:6379`
* MinIO: `http://localhost:9000`
* MinIO Console: `http://localhost:9001`

  * Username: `minio`
  * Password: `minio123`

### 2. Create the `uploads` bucket

```bash
docker exec -it upload_minio sh
mc alias set local http://localhost:9000 minio minio123
mc mb local/uploads
mc anonymous set download local/uploads
```

This makes the bucket publicly readable.

---

### 3. Start the NestJS server

```bash
npm run start:dev
```

Server runs at `http://localhost:3000`.

---

## API Endpoints

### 1. **Upload File**

**POST /upload**

* Form field: `file`
* Response:

```json
{
  "key": "uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
  "url": "http://localhost:3000/files/uploads/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

**Curl Example:**

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@/path/to/image.jpg"
```

---

### 2. **Access File**

**GET /files/:key**

* Returns a **redirect to a presigned MinIO URL** valid for 1 hour.

**Curl Example:**

```bash
curl -L http://localhost:3000/files/uploads/550e8400-e29b-41d4-a716-446655440000.jpg --output downloaded.jpg
```

---

## Background Processing

* Queue: `image-queue` (BullMQ)
* Task: `optimize` — create thumbnails or resize images.
* Logs show processing progress:

```
Processing uploads/550e8400-e29b-41d4-a716-446655440000.jpg, creating thumbnail uploads/550e8400-e29b-41d4-a716-446655440000_thumb.jpg
```

---

## Development

* Use **TypeScript + NestJS** conventions.
* Hot reload: `npm run start:dev`.
* Worker runs as part of NestJS app (BullMQ processors).

---

## Testing

* **Postman**: Import `file-upload.postman_collection.json`.
* **Curl**: See API examples above.

---

## Project Structure

```
src/
├─ file-upload/
│  ├─ file-upload.module.ts
│  ├─ file-upload.service.ts
│  ├─ file-upload.controller.ts
│  └─ file.processor.ts
```

* `file-upload.service.ts` → Handles MinIO uploads & queueing
* `file.processor.ts` → Handles async processing (resize / thumbnail)
* `file-upload.controller.ts` → Upload + file access endpoints

---

## Environment Variables

| Variable        | Description                           |
| --------------- | ------------------------------------- |
| PORT            | NestJS server port                    |
| REDIS_HOST      | Redis hostname                        |
| REDIS_PORT      | Redis port                            |
| S3_ENDPOINT     | MinIO endpoint URL                    |
| S3_BUCKET       | Bucket name                           |
| S3_KEY          | MinIO access key                      |
| S3_SECRET       | MinIO secret key                      |
| PUBLIC_FILE_URL | URL prefix for serving uploaded files |

---

## Notes

* Bucket policy must allow public read (`mc anonymous set download local/uploads`).
* Presigned URLs expire in 1 hour.
* Recommended to serve files via NestJS to hide MinIO credentials in production.

---

## License

MIT © Your Name

---

If you want, I can also add a **“Quick Test” section with ready curl scripts that test upload + processing + thumbnail download** so anyone can verify the system in one go.

Do you want me to do that?
