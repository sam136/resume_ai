import { GridFSBucket, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { storageConfig } from '../config/services';

class StorageService {
  private bucket: GridFSBucket;

  constructor() {
    this.bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: storageConfig.bucketName,
      chunkSizeBytes: storageConfig.chunkSize
    });
  }

  async uploadFile(filename: string, buffer: Buffer, mimeType: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename, {
        contentType: mimeType
      });

      uploadStream.on('error', (error) => {
        console.error('File upload failed:', error);
        reject(new Error('Failed to upload file'));
      });

    uploadStream.on('finish', (file: { _id: ObjectId }) => {
      resolve(file._id.toString());
    });

      uploadStream.write(buffer);
      uploadStream.end();
    });
  }

  async getFile(fileId: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const downloadStream = this.bucket.openDownloadStream(new ObjectId(fileId));

      downloadStream.on('data', (chunk) => chunks.push(chunk));
      downloadStream.on('error', (error) => {
        console.error('File retrieval failed:', error);
        reject(new Error('Failed to retrieve file'));
      });
      downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.bucket.delete(new ObjectId(fileId));
    } catch (error) {
      console.error('File deletion failed:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getFileInfo(fileId: string) {
    const files = await this.bucket.find({ _id: new ObjectId(fileId) }).toArray();
    return files[0] || null;
  }
}

export const storageService = new StorageService();
