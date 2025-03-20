import { FileMetadata, DocumentStorageOptions } from '../types/files';
import path from 'path';
import fs from 'fs/promises';

export class StorageService {
  private baseDir: string;
  private options: DocumentStorageOptions;

  constructor(baseDir: string, options: DocumentStorageOptions = {}) {
    this.baseDir = baseDir;
    this.options = {
      prefix: 'upload_',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['.pdf', '.doc', '.docx'],
      ...options
    };
  }

  async saveFile(file: Buffer, metadata: Omit<FileMetadata, 'uploadDate'>): Promise<FileMetadata> {
    const fileName = `${this.options.prefix}${Date.now()}_${metadata.fileName}`;
    const filePath = path.join(this.baseDir, fileName);
    
    await fs.writeFile(filePath, file);
    
    return {
      ...metadata,
      uploadDate: new Date(),
    };
  }

  async getFile(fileName: string): Promise<Buffer> {
    const filePath = path.join(this.baseDir, fileName);
    return fs.readFile(filePath);
  }
}
