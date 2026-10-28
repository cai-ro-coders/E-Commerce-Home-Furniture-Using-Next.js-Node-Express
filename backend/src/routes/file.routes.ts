import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import {
  backupHandler,
  deleteFileHandler,
  fileStatsHandler,
  getFileHandler,
  listBackupsHandler,
  listFilesHandler,
  moveFileHandler,
  uploadFilesHandler,
  uploadSingleHandler,
} from '../controllers/file.controller';
import { uploadImageHandler } from '../controllers/upload.controller';
import { fileListQuerySchema } from '../validators/order.validator';
import { idParamSchema } from '../validators/common.validator';
import { upload, uploadAny } from '../middleware/upload';
import { optionalIdParamSchema } from '../validators/common.validator';

const router = Router();

// The File Manager is admin-only, including the generic upload endpoint that
// the product, category, brand and profile forms all post to.
router.use(authenticate, requireAdmin);

router.get('/', validate(fileListQuerySchema, 'query'), listFilesHandler);
router.get('/stats', fileStatsHandler);
router.get('/backups', listBackupsHandler);
router.post('/backups', backupHandler);
router.get('/:id', validate(idParamSchema, 'params'), getFileHandler);

router.post('/upload', uploadAny, uploadFilesHandler);
router.post('/upload-single', upload.single('file'), uploadSingleHandler);

/** One-image upload used by the inline "Change photo" pickers. */
router.post('/upload-image', upload.single('image'), uploadImageHandler);

router.patch('/:id', validate(idParamSchema, 'params'), moveFileHandler);
router.delete('/:id', validate(idParamSchema, 'params'), deleteFileHandler);

export default router;
