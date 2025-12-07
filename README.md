Here’s a professional, clear, and complete README for your **NestJS File Upload + MinIO + BullMQ Image Processing** project. You can drop it as `README.md` in your repo.

---

# File Upload & Async Image Processing Service

## Project Overview

This is a NestJS application designed for asynchronous file uploading and processing. It allows users to upload files, which are then processed in the background. The application uses a queue to manage processing jobs and an object storage service to store the files.

## Architecture

The application is composed of three main modules:

-   **Upload Module**: Handles file uploads, creates processing jobs, and provides endpoints for checking the status and results of the jobs.
-   **Queue Module**: Manages the job queue using BullMQ and Redis.
-   **S3 Module**: Interacts with an S3-compatible object storage service (MinIO in the local setup) to store the original and processed files.

The workflow is as follows:

1.  A user uploads a file through the `/upload` endpoint.
2.  The `UploadService` uploads the original file to the S3 service.
3.  A job is added to the `image-processing` queue.
4.  The `UploadProcessor` picks up the job, retrieves the file from S3, processes it (resizes and compresses), and uploads the processed versions (main image and thumbnail) back to S3.
5.  The job status is updated in the `UploadService`.

---

## Features

* Upload images via `POST /upload` (multipart/form-data).
* Async image processing (resize / thumbnail) with BullMQ.
* Store images in MinIO (S3-compatible storage).

* Fully containerized with Docker (MinIO + Redis).
* TypeScript, NestJS, and AWS SDK v3 ready.

---

## Requirements

* Node.js ≥ 18
* pnpm
* Docker

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/file-upload-service.git
cd file-upload-service
```

2. Install dependencies:

```bash
pnpm install
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



### 3. Start the NestJS server

```bash
pnpm run start:dev```

Server runs at `http://localhost:3000`.

---

## API Endpoints

-   `POST /upload`: Uploads a file. The file should be sent as a multipart/form-data with the key `file`.

    **Curl Example:**

    ```bash
    curl -X POST http://localhost:3000/upload \
      -F "file=@/path/to/image.jpg"
    ```

-   `GET /upload/:id/status`: Gets the status of a processing job.

    **Curl Example:**

    ```bash
    curl http://localhost:3000/upload/job-id-here/status
    ```

-   `GET /upload/:id/result`: Gets the result of a processing job, including the URLs of the processed files.

    **Curl Example:**

    ```bash
    curl http://localhost:3000/upload/job-id-here/result
    ```

---

## Background Processing

* Queue: `image-processing` (BullMQ)
* Task: `optimize` — create thumbnails or resize images.
* Logs show processing progress:

```
Processing uploads/550e8400-e29b-41d4-a716-446655440000.jpg, creating thumbnail uploads/550e8400-e29b-41d4-a716-446655440000_thumb.jpg
```

---

## Development

* Use **TypeScript + NestJS** conventions.
* pnpm run start:dev
* Worker runs as part of NestJS app (BullMQ processors).

---

## Testing

* **Postman**: Import `file-upload.postman_collection.json`.
* **Curl**: See API examples above.

---

## Project Structure

```
src/
├───entities/
│   └───upload.entity.ts
├───queue/
│   └───queue.module.ts
├───s3/
│   ├───s3.module.ts
│   └───s3.service.ts
└───upload/
    ├───upload.controller.ts
    ├───upload.module.ts
    ├───upload.processor.ts
    └───upload.service.ts
```

* `upload.service.ts`: Handles file uploads, creates processing jobs, and provides endpoints for checking the status and results of the jobs.
* `upload.processor.ts`: Picks up jobs from the queue, retrieves files from S3, processes them, and uploads processed versions back to S3.
* `upload.controller.ts`: Provides the HTTP endpoints for file uploads and job status/result retrieval.
* `s3.service.ts`: Interacts with the S3-compatible object storage service.

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
