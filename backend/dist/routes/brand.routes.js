"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const brand_controller_1 = require("../controllers/brand.controller");
const catalog_validator_1 = require("../validators/catalog.validator");
const common_validator_1 = require("../validators/common.validator");
const router = (0, express_1.Router)();
/** Public: the storefront brand filter and product pages read this. */
router.get('/all', auth_1.optionalAuth, brand_controller_1.allBrandsHandler);
router.use(auth_1.authenticate, rbac_1.requireStaff);
router.get('/', (0, asyncHandler_1.validate)(catalog_validator_1.brandListQuerySchema, 'query'), brand_controller_1.listBrandsHandler);
router.get('/export', brand_controller_1.exportBrandsHandler);
router.get('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), brand_controller_1.getBrandHandler);
router.post('/', (0, asyncHandler_1.validate)(catalog_validator_1.createBrandSchema), brand_controller_1.createBrandHandler);
router.put('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(catalog_validator_1.updateBrandSchema), brand_controller_1.updateBrandHandler);
router.delete('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), brand_controller_1.deleteBrandHandler);
router.delete('/:id/force', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), brand_controller_1.forceDeleteBrandHandler);
exports.default = router;
//# sourceMappingURL=brand.routes.js.map