import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || '';
const GCP_BUCKET_NAME = process.env.GCP_STORAGE_BUCKET || '';
const GCP_KEY_PATH = process.env.GCP_SERVICE_ACCOUNT_KEY_PATH || '';

let storage: Storage | null = null;

// Initialize storage only if credentials are provided
if (GCP_PROJECT_ID && GCP_KEY_PATH && fs.existsSync(GCP_KEY_PATH)) {
  storage = new Storage({
    projectId: GCP_PROJECT_ID,
    keyFilename: GCP_KEY_PATH,
  });
}

export class StorageService {
  private bucket: any;

  constructor() {
    if (!storage || !GCP_BUCKET_NAME) {
      console.warn('GCP Storage not configured. Log storage will be disabled.');
      this.bucket = null;
      return;
    }
    this.bucket = storage.bucket(GCP_BUCKET_NAME);
  }

  async uploadJobLogs(jobId: string, logContent: string): Promise<string | null> {
    if (!this.bucket) {
      console.warn('GCP Storage not available. Skipping log upload.');
      return null;
    }

    try {
      const fileName = `job-logs/${jobId}.txt`;
      const file = this.bucket.file(fileName);

      await file.save(logContent, {
        contentType: 'text/plain',
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });

      // Generate a signed URL that expires in 7 days
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return url;
    } catch (error) {
      console.error('Error uploading logs to GCP Storage:', error);
      throw new Error('Failed to upload logs to storage');
    }
  }

  async getJobLogs(jobId: string): Promise<string | null> {
    if (!this.bucket) {
      console.warn('GCP Storage not available.');
      return null;
    }

    try {
      const fileName = `job-logs/${jobId}.txt`;
      const file = this.bucket.file(fileName);

      const [contents] = await file.download();
      return contents.toString('utf-8');
    } catch (error) {
      console.error('Error downloading logs from GCP Storage:', error);
      return null;
    }
  }

  async deleteJobLogs(jobId: string): Promise<boolean> {
    if (!this.bucket) {
      return false;
    }

    try {
      const fileName = `job-logs/${jobId}.txt`;
      await this.bucket.file(fileName).delete();
      return true;
    } catch (error) {
      console.error('Error deleting logs from GCP Storage:', error);
      return false;
    }
  }
}
