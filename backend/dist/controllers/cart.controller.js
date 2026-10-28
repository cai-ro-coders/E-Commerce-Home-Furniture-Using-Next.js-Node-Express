"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistToCartHandler = exports.checkWishlistHandler = exports.removeWishlistHandler = exports.addWishlistHandler = exports.getWishlistHandler = exports.summaryCouponHandler = exports.cartSummaryHandler = exports.clearCartHandler = exports.removeCartItemHandler = exports.updateCartItemHandler = exports.addCartItemHandler = exports.getCartBadgeHandler = exports.getCartHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const cart_service_1 = require("../services/cart.service");
const coupon_service_1 = require("../services/coupon.service");
const userId = (req) => req.user.id;
// -------------------------------------------------------------------- cart
exports.getCartHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, cart_service_1.getCartDetail)(userId(req)));
});
/** Item count only — the header badge should not download the whole cart. */
exports.getCartBadgeHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, cart_service_1.getCartBadge)(userId(req)));
});
exports.addCartItemHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const cart = await (0, cart_service_1.addItem)(userId(req), Number(body.product_id), Number(body.quantity ?? 1));
    return (0, ApiResponse_1.created)(res, cart, 'Item added to cart');
});
exports.updateCartItemHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const cart = await (0, cart_service_1.updateItem)(userId(req), Number(req.params.itemId), Number(body.quantity));
    return (0, ApiResponse_1.ok)(res, cart, 'Cart updated');
});
exports.removeCartItemHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cart = await (0, cart_service_1.removeItem)(userId(req), Number(req.params.itemId));
    return (0, ApiResponse_1.ok)(res, cart, 'Item removed');
});
exports.clearCartHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cart = await (0, cart_service_1.emptyCart)(userId(req));
    return (0, ApiResponse_1.ok)(res, cart, 'Cart emptied');
});
/**
 * Cart totals with an optional coupon applied. Kept separate from the cart read
 * because the coupon code is per-request state, not stored on the cart.
 */
exports.cartSummaryHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const code = typeof req.query.coupon === 'string' ? req.query.coupon : undefined;
    return (0, ApiResponse_1.ok)(res, await (0, cart_service_1.getCartSummary)(userId(req), code));
});
exports.summaryCouponHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const result = await (0, coupon_service_1.checkCoupon)(body.code, Number(body.cart_total), userId(req));
    return (0, ApiResponse_1.ok)(res, result, 'Coupon applied');
});
// ---------------------------------------------------------------- wishlist
exports.getWishlistHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, cart_service_1.getWishlist)(userId(req)));
});
exports.addWishlistHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const wishlist = await (0, cart_service_1.addWish)(userId(req), Number(body.product_id));
    return (0, ApiResponse_1.created)(res, wishlist, 'Saved to wishlist');
});
exports.removeWishlistHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const productId = Number(req.params.productId);
    const wishlist = await (0, cart_service_1.removeWish)(userId(req), productId);
    return (0, ApiResponse_1.ok)(res, wishlist, 'Removed from wishlist');
});
exports.checkWishlistHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, { in_wishlist: await (0, cart_service_1.checkWish)(userId(req), Number(req.params.productId)) });
});
exports.wishlistToCartHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const productId = Number(req.params.productId);
    if (!(await (0, cart_service_1.checkWish)(userId(req), productId))) {
        throw ApiError_1.ApiError.badRequest('That product is not on your wishlist');
    }
    const cart = await (0, cart_service_1.wishToCart)(userId(req), productId);
    return (0, ApiResponse_1.created)(res, cart, 'Moved to cart');
});
//# sourceMappingURL=cart.controller.js.map