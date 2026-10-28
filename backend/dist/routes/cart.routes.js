"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const cart_controller_1 = require("../controllers/cart.controller");
const order_validator_1 = require("../validators/order.validator");
const common_validator_1 = require("../validators/common.validator");
const router = (0, express_1.Router)();
/**
 * The customer's own basket. The router is mounted at `/api/cart`, so these
 * paths are the last segment only — `/api/cart/items`, not `/api/cart/cart`.
 */
router.use(auth_1.authenticate);
router.get('/', cart_controller_1.getCartHandler);
router.get('/badge', cart_controller_1.getCartBadgeHandler);
router.get('/summary', cart_controller_1.cartSummaryHandler);
router.post('/items', (0, asyncHandler_1.validate)(order_validator_1.addCartItemSchema), cart_controller_1.addCartItemHandler);
router.put('/items/:itemId', (0, asyncHandler_1.validate)(common_validator_1.itemIdParamSchema, 'params'), (0, asyncHandler_1.validate)(order_validator_1.updateCartItemSchema), cart_controller_1.updateCartItemHandler);
router.delete('/items/:itemId', (0, asyncHandler_1.validate)(common_validator_1.itemIdParamSchema, 'params'), cart_controller_1.removeCartItemHandler);
router.delete('/', cart_controller_1.clearCartHandler);
// Applying a coupon is per-request state, not something stored on the cart row.
router.post('/coupon', cart_controller_1.summaryCouponHandler);
exports.default = router;
//# sourceMappingURL=cart.routes.js.map