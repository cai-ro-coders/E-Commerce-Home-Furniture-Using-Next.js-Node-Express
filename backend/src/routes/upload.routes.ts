import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadImageHandler } from '../controllers/upload.controller';
import { uploadSingleImage } from '../middleware/upload';

const router = Router();

/**
 * Single-image upload shared by the product, category, brand, user and review
 * forms. Returns the stored file record, whose `path` is what the form saves.
 */
router.post('/image', authenticate, uploadSingleImage, uploadImageHandler);

export default router;
