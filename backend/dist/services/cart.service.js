"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartDetail = getCartDetail;
exports.getCartBadge = getCartBadge;
exports.addItem = addItem;
exports.updateItem = updateItem;
exports.removeItem = removeItem;
exports.emptyCart = emptyCart;
exports.getWishlist = getWishlist;
exports.addWish = addWish;
exports.removeWish = removeWish;
exports.checkWish = checkWish;
exports.wishToCart = wishToCart;
exports.getCartSummary = getCartSummary;
const cart_model_1 = require("../models/cart.model");
const coupon_model_1 = require("../models/coupon.model");
const setting_model_1 = require("../models/setting.model");
const pricing_1 = require("../utils/pricing");
async function getCartDetail(userId) {
    return (0, cart_model_1.getCart)(userId);
}
async function getCartBadge(userId) {
    return { count: await (0, cart_model_1.cartCount)(userId) };
}
async function addItem(userId, productId, quantity) {
    return (0, cart_model_1.addCartItem)(userId, productId, quantity);
}
async function updateItem(userId, itemId, quantity) {
    return (0, cart_model_1.updateCartItemQuantity)(userId, itemId, quantity);
}
async function removeItem(userId, itemId) {
    return (0, cart_model_1.removeCartItem)(userId, itemId);
}
async function emptyCart(userId) {
    await (0, cart_model_1.clearCart)(userId);
    return (0, cart_model_1.getCart)(userId);
}
// ---------------------------------------------------------------- wishlist
async function getWishlist(userId) {
    const [items, settings] = await Promise.all([(0, cart_model_1.listWishlist)(userId), (0, setting_model_1.settingsMap)()]);
    return { items, currency: settings.currency ?? 'PHP' };
}
async function addWish(userId, productId) {
    await (0, cart_model_1.addToWishlist)(userId, productId);
    return getWishlist(userId);
}
async function removeWish(userId, productId) {
    const removed = await (0, cart_model_1.removeFromWishlist)(userId, productId);
    if (!removed)
        return { removed: false, ...(await getWishlist(userId)) };
    return { removed: true, ...(await getWishlist(userId)) };
}
async function checkWish(userId, productId) {
    return { in_wishlist: await (0, cart_model_1.isInWishlist)(userId, productId) };
}
async function wishToCart(userId, productId) {
    return (0, cart_model_1.moveWishlistItemToCart)(userId, productId);
}
/**
 * Cart summary with live tax/shipping applied, used by the cart drawer and the
 * checkout page. Totals mirror the order-creation maths exactly.
 */
async function getCartSummary(userId, couponCode) {
    const cart = await (0, cart_model_1.getCart)(userId);
    const settings = await (0, setting_model_1.settingsMap)();
    let discount = 0;
    let coupon = null;
    if (couponCode) {
        coupon = await (0, coupon_model_1.evaluateCoupon)(couponCode, Number(cart.summary.subtotal), userId);
        if (coupon.valid)
            discount = coupon.discount;
    }
    // Same helper the order transaction uses, so the quoted total is the charged
    // total to the peso.
    const totals = (0, pricing_1.computeTotals)({
        subtotal: Number(cart.summary.subtotal),
        discount,
        taxRatePercent: Number(settings.tax_rate ?? 12),
        shippingFee: Number(settings.shipping_fee ?? 0),
        freeShippingThreshold: Number(settings.free_shipping_threshold ?? 0),
    });
    return {
        ...cart,
        coupon,
        totals: {
            subtotal: String(totals.subtotal),
            discount: String(totals.discount),
            shipping_fee: String(totals.shippingFee),
            tax: String(totals.tax),
            total: String(totals.grandTotal),
            free_shipping: totals.freeShipping,
            free_shipping_threshold: String(settings.free_shipping_threshold ?? '0'),
            currency: settings.currency ?? 'PHP',
        },
    };
}
//# sourceMappingURL=cart.service.js.map