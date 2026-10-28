"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const product_controller_1 = require("../controllers/product.controller");
const product_validator_1 = require("../validators/product.validator");
const common_validator_1 = require("../validators/common.validator");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// ------------------------------------------------------------- storefront
// Public catalogue. `optionalAuth` lets the response flag which items are
// already on the signed-in customer's wishlist without requiring a session.
router.get('/browse', auth_1.optionalAuth, product_controller_1.browseHandler);
// Must be declared before `/browse/:slug`, which would otherwise read "facets"
// as a product slug.
router.get('/browse/facets', auth_1.optionalAuth, product_controller_1.browseFacetsHandler);
router.get('/browse/:slug', auth_1.optionalAuth, product_controller_1.browseDetailHandler);
// ----------------------------------------------------------------- admin
router.use(auth_1.authenticate, rbac_1.requireStaff);
router.get('/', (0, asyncHandler_1.validate)(product_validator_1.productListQuerySchema, 'query'), product_controller_1.listProductsHandler);
router.get('/stats', product_controller_1.productStatsHandler);
router.get('/form-options', product_controller_1.productFormOptionsHandler);
router.get('/export', product_controller_1.exportProductsHandler);
router.get('/inventory-logs', (0, asyncHandler_1.validate)(product_validator_1.productListQuerySchema, 'query'), product_controller_1.inventoryLogsHandler);
router.get('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), product_controller_1.getProductHandler);
router.post('/', (0, asyncHandler_1.validate)(product_validator_1.createProductSchema), product_controller_1.createProductHandler);
router.put('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(product_validator_1.updateProductSchema), product_controller_1.updateProductHandler);
router.delete('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), product_controller_1.deleteProductHandler);
// Images: multipart files are validated by multer (mime allow-list, size cap,
// folder allow-list). When the client instead posts an already-stored path the
// controller checks it points at an upload.
router.get('/:id/images', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), product_controller_1.listImagesHandler);
router.post('/:id/images', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), upload_1.uploadAny, product_controller_1.addImageHandler);
router.delete('/:id/images/:imageId', (0, asyncHandler_1.validate)(common_validator_1.productImageParamSchema, 'params'), product_controller_1.deleteImageHandler);
router.patch('/:id/images/:imageId/primary', (0, asyncHandler_1.validate)(common_validator_1.productImageParamSchema, 'params'), product_controller_1.primaryImageHandler);
router.get('/:id/specifications', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), product_controller_1.listSpecificationsHandler);
router.put('/:id/specifications', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(product_validator_1.productSpecificationsSchema), product_controller_1.saveSpecificationsHandler);
router.post('/:id/stock', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(product_validator_1.inventoryAdjustmentSchema), product_controller_1.stockHandler);
exports.default = router;
//# sourceMappingURL=product.routes.js.map