import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { AppError } from '../utils/appError';

let gfs: GridFSBucket;
mongoose.connection.once('open', () => {
  gfs = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
});

export const uploadFile = async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const writeStream = gfs.openUploadStream(req.file.originalname, {
    metadata: {
      userId: req.user!.id,
      contentType: req.file.mimetype
    }
  });

  // Convert buffer to stream and pipe to GridFS
  const bufferStream = require('stream').Readable.from(req.file.buffer);
  bufferStream.pipe(writeStream);

interface UploadedFile {
    _id: mongoose.Types.ObjectId;
    filename: string;
}

writeStream.on('finish', (file: UploadedFile) => {
    res.status(201).json({
        id: file._id,
        filename: file.filename,
        contentType: req.file!.mimetype
    });
});

  writeStream.on('error', () => {
    throw new AppError('Error uploading file', 500);
  });
};

export const downloadFile = async (req: Request, res: Response) => {
  try {
    const _id = new mongoose.Types.ObjectId(req.params.fileId);
    const files = await gfs.find({ _id }).toArray();
    
    if (!files.length) {
      throw new AppError('File not found', 404);
    }

    const file = files[0];
    res.set('Content-Type', file.metadata?.contentType || 'application/octet-stream');
    
    const downloadStream = gfs.openDownloadStream(_id);
    downloadStream.pipe(res);
  } catch (error) {
    throw new AppError('Error downloading file', 500);
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const _id = new mongoose.Types.ObjectId(req.params.fileId);
    await gfs.delete(_id);
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    throw new AppError('Error deleting file', 500);
  }
};
