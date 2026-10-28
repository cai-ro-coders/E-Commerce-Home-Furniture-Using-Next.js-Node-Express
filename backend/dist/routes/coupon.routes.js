"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const coupon_controller_1 = require("../controllers/coupon.controller");
const catalog_validator_1 = require("../validators/catalog.validator");
const common_validator_1 = require("../validators/common.validator");
const router = (0, express_1.Router)();
/** Anyone may test a code at checkout; the service enforces the per-user limit. */
router.post('/validate', auth_1.optionalAuth, (0, asyncHandler_1.validate)(catalog_validator_1.validateCouponSchema), coupon_controller_1.validateCouponHandler);
router.use(auth_1.authenticate, rbac_1.requireStaff);
router.get('/', (0, asyncHandler_1.validate)(catalog_validator_1.couponListQuerySchema, 'query'), coupon_controller_1.listCouponsHandler);
router.get('/export', coupon_controller_1.exportCouponsHandler);
router.get('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), coupon_controller_1.getCouponHandler);
router.get('/:id/usages', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(catalog_validator_1.couponListQuerySchema, 'query'), coupon_controller_1.couponUsagesHandler);
router.post('/', (0, asyncHandler_1.validate)(catalog_validator_1.createCouponSchema), coupon_controller_1.createCouponHandler);
router.put('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(catalog_validator_1.updateCouponSchema), coupon_controller_1.updateCouponHandler);
router.delete('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), coupon_controller_1.deleteCouponHandler);
exports.default = router;
//# sourceMappingURL=coupon.routes.js.map