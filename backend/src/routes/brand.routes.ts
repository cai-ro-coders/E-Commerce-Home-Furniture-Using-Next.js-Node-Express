import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireStaff } from '../middleware/rbac';
import {
  allBrandsHandler,
  createBrandHandler,
  deleteBrandHandler,
  exportBrandsHandler,
  forceDeleteBrandHandler,
  getBrandHandler,
  listBrandsHandler,
  updateBrandHandler,
} from '../controllers/brand.controller';
import {
  brandListQuerySchema,
  createBrandSchema,
  updateBrandSchema,
} from '../validators/catalog.validator';
import { idParamSchema } from '../validators/common.validator';

const router = Router();

/** Public: the storefront brand filter and product pages read this. */
router.get('/all', optionalAuth, allBrandsHandler);

router.use(authenticate, requireStaff);

router.get('/', validate(brandListQuerySchema, 'query'), listBrandsHandler);
router.get('/export', exportBrandsHandler);
router.get('/:id', validate(idParamSchema, 'params'), getBrandHandler);
router.post('/', validate(createBrandSchema), createBrandHandler);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateBrandSchema), updateBrandHandler);
router.delete('/:id', validate(idParamSchema, 'params'), deleteBrandHandler);
router.delete('/:id/force', validate(idParamSchema, 'params'), forceDeleteBrandHandler);

export default router;
