"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const review_controller_1 = require("../controllers/review.controller");
const order_validator_1 = require("../validators/order.validator");
const common_validator_1 = require("../validators/common.validator");
const router = (0, express_1.Router)();
/** Public: the product detail page shows the approved review list. */
router.get('/product/:id', auth_1.optionalAuth, review_controller_1.productReviewsHandler);
router.use(auth_1.authenticate);
/** A customer may review a product they bought; the service verifies the order. */
router.post('/', (0, asyncHandler_1.validate)(order_validator_1.createReviewSchema), review_controller_1.createReviewHandler);
router.put('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(order_validator_1.updateReviewSchema), review_controller_1.updateReviewHandler);
router.delete('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), review_controller_1.deleteReviewHandler);
router.use(rbac_1.requireStaff);
router.get('/', (0, asyncHandler_1.validate)(order_validator_1.reviewListQuerySchema, 'query'), review_controller_1.listReviewsHandler);
router.get('/stats', review_controller_1.reviewStatsHandler);
router.get('/export', review_controller_1.exportReviewsHandler);
router.get('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), review_controller_1.getReviewHandler);
router.patch('/:id/status', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), review_controller_1.moderateReviewHandler);
exports.default = router;
//# sourceMappingURL=review.routes.js.map