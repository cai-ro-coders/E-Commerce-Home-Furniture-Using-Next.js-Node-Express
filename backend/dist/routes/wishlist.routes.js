"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const cart_controller_1 = require("../controllers/cart.controller");
const order_validator_1 = require("../validators/order.validator");
const common_validator_1 = require("../validators/common.validator");
const router = (0, express_1.Router)();
/** Everything in a wishlist belongs to the signed-in customer. */
router.use(auth_1.authenticate);
router.get('/', cart_controller_1.getWishlistHandler);
router.post('/', (0, asyncHandler_1.validate)(order_validator_1.addWishlistSchema), cart_controller_1.addWishlistHandler);
router.get('/:productId', (0, asyncHandler_1.validate)(common_validator_1.productIdParamSchema, 'params'), cart_controller_1.checkWishlistHandler);
router.delete('/:productId', (0, asyncHandler_1.validate)(common_validator_1.productIdParamSchema, 'params'), cart_controller_1.removeWishlistHandler);
/** Move a saved product into the basket in one step. */
router.post('/:productId/to-cart', (0, asyncHandler_1.validate)(common_validator_1.productIdParamSchema, 'params'), cart_controller_1.wishlistToCartHandler);
exports.default = router;
//# sourceMappingURL=wishlist.routes.js.map