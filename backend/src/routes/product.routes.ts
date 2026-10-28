import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireStaff } from '../middleware/rbac';
import {
  addImageHandler,
  browseDetailHandler,
  browseFacetsHandler,
  browseHandler,
  createProductHandler,
  deleteImageHandler,
  deleteProductHandler,
  exportProductsHandler,
  getProductHandler,
  inventoryLogsHandler,
  listImagesHandler,
  listProductsHandler,
  listSpecificationsHandler,
  primaryImageHandler,
  productFormOptionsHandler,
  productStatsHandler,
  saveSpecificationsHandler,
  stockHandler,
  updateProductHandler,
} from '../controllers/product.controller';
import {
  createProductSchema,
  inventoryAdjustmentSchema,
  productListQuerySchema,
  productSpecificationsSchema,
  updateProductSchema,
} from '../validators/product.validator';
import { idParamSchema, productImageParamSchema } from '../validators/common.validator';
import { uploadAny } from '../middleware/upload';

const router = Router();

// ------------------------------------------------------------- storefront
// Public catalogue. `optionalAuth` lets the response flag which items are
// already on the signed-in customer's wishlist without requiring a session.
router.get('/browse', optionalAuth, browseHandler);
// Must be declared before `/browse/:slug`, which would otherwise read "facets"
// as a product slug.
router.get('/browse/facets', optionalAuth, browseFacetsHandler);
router.get('/browse/:slug', optionalAuth, browseDetailHandler);

// ----------------------------------------------------------------- admin
router.use(authenticate, requireStaff);

router.get('/', validate(productListQuerySchema, 'query'), listProductsHandler);
router.get('/stats', productStatsHandler);
router.get('/form-options', productFormOptionsHandler);
router.get('/export', exportProductsHandler);
router.get('/inventory-logs', validate(productListQuerySchema, 'query'), inventoryLogsHandler);
router.get('/:id', validate(idParamSchema, 'params'), getProductHandler);

router.post('/', validate(createProductSchema), createProductHandler);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateProductSchema), updateProductHandler);
router.delete('/:id', validate(idParamSchema, 'params'), deleteProductHandler);

// Images: multipart files are validated by multer (mime allow-list, size cap,
// folder allow-list). When the client instead posts an already-stored path the
// controller checks it points at an upload.
router.get('/:id/images', validate(idParamSchema, 'params'), listImagesHandler);
router.post('/:id/images', validate(idParamSchema, 'params'), uploadAny, addImageHandler);
router.delete('/:id/images/:imageId', validate(productImageParamSchema, 'params'), deleteImageHandler);
router.patch('/:id/images/:imageId/primary', validate(productImageParamSchema, 'params'), primaryImageHandler);

router.get('/:id/specifications', validate(idParamSchema, 'params'), listSpecificationsHandler);
router.put(
  '/:id/specifications',
  validate(idParamSchema, 'params'),
  validate(productSpecificationsSchema),
  saveSpecificationsHandler
);

router.post(
  '/:id/stock',
  validate(idParamSchema, 'params'),
  validate(inventoryAdjustmentSchema),
  stockHandler
);

export default router;
