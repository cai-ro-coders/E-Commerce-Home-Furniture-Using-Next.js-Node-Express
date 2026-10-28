import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created } from '../utils/ApiResponse';
import { storeUpload } from '../services/file.service';

/**
 * Generic single-image endpoint used by the product, category, brand, user and
 * review forms. It returns the stored row so the client can immediately set the
 * hidden input to the returned `/uploads/...` path.
 */
export const uploadImageHandler = asyncHandler(async (req: Request, res: Response) => {
  const stored = await storeUpload(req.file as Express.Multer.File, 'image', req.user?.id ?? null);
  return created(res, stored, 'Image uploaded');
});
