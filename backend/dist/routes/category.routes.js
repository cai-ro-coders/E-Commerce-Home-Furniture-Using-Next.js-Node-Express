"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const category_controller_1 = require("../controllers/category.controller");
const catalog_validator_1 = require("../validators/catalog.validator");
const common_validator_1 = require("../validators/common.validator");
const router = (0, express_1.Router)();
/** Public: the storefront navigation and the category filter both read this. */
router.get('/tree', auth_1.optionalAuth, category_controller_1.categoryTreeHandler);
router.use(auth_1.authenticate, rbac_1.requireStaff);
router.get('/', (0, asyncHandler_1.validate)(catalog_validator_1.categoryListQuerySchema, 'query'), category_controller_1.listCategoriesHandler);
router.get('/export', category_controller_1.exportCategoriesHandler);
router.get('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), category_controller_1.getCategoryHandler);
router.post('/', (0, asyncHandler_1.validate)(catalog_validator_1.createCategorySchema), category_controller_1.createCategoryHandler);
router.put('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(catalog_validator_1.updateCategorySchema), category_controller_1.updateCategoryHandler);
router.delete('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), category_controller_1.deleteCategoryHandler);
exports.default = router;
//# sourceMappingURL=category.routes.js.map