import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireStaff } from '../middleware/rbac';
import {
  createCategoryHandler,
  categoryTreeHandler,
  deleteCategoryHandler,
  exportCategoriesHandler,
  getCategoryHandler,
  listCategoriesHandler,
  updateCategoryHandler,
} from '../controllers/category.controller';
import {
  categoryListQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validators/catalog.validator';
import { idParamSchema } from '../validators/common.validator';

const router = Router();

/** Public: the storefront navigation and the category filter both read this. */
router.get('/tree', optionalAuth, categoryTreeHandler);

router.use(authenticate, requireStaff);

router.get('/', validate(categoryListQuerySchema, 'query'), listCategoriesHandler);
router.get('/export', exportCategoriesHandler);
router.get('/:id', validate(idParamSchema, 'params'), getCategoryHandler);
router.post('/', validate(createCategorySchema), createCategoryHandler);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateCategorySchema), updateCategoryHandler);
router.delete('/:id', validate(idParamSchema, 'params'), deleteCategoryHandler);

export default router;
