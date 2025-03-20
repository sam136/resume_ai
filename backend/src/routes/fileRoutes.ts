import express from 'express';
import { protect } from '../middleware/auth';
import { uploadFile, downloadFile, deleteFile } from '../controllers/fileController';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(protect);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/download/:fileId', downloadFile);
router.delete('/:fileId', deleteFile);

export default router;
