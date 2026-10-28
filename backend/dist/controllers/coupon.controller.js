"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCouponsHandler = exports.validateCouponHandler = exports.deleteCouponHandler = exports.updateCouponHandler = exports.createCouponHandler = exports.couponUsagesHandler = exports.getCouponHandler = exports.listCouponsHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const pagination_1 = require("../utils/pagination");
const ApiError_1 = require("../utils/ApiError");
const coupon_service_1 = require("../services/coupon.service");
exports.listCouponsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.paginated)(res, await (0, coupon_service_1.getCoupons)((0, pagination_1.parseListQuery)(req)));
});
exports.getCouponHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, coupon_service_1.getCoupon)(Number(req.params.id)));
});
/** Redemption history for the coupon detail drawer. */
exports.couponUsagesHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.paginated)(res, await (0, coupon_service_1.getCouponUsages)(Number(req.params.id), (0, pagination_1.parseListQuery)(req)));
});
exports.createCouponHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const record = await (0, coupon_service_1.createNewCoupon)(req.body);
    return (0, ApiResponse_1.created)(res, { id: record.id }, 'Coupon created successfully');
});
exports.updateCouponHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const coupon = await (0, coupon_service_1.updateExistingCoupon)(Number(req.params.id), req.body);
    return (0, ApiResponse_1.ok)(res, coupon, 'Coupon updated successfully');
});
exports.deleteCouponHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, coupon_service_1.removeCoupon)(Number(req.params.id));
    return (0, ApiResponse_1.noContent)(res);
});
/**
 * Validate a code against the caller's cart total. Signed in because the
 * usage limit is per-user, so an anonymous check would be misleading.
 */
exports.validateCouponHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    if (typeof body.cart_total !== 'number' || body.cart_total < 0) {
        throw ApiError_1.ApiError.badRequest('A cart total is required to validate a coupon');
    }
    const result = await (0, coupon_service_1.checkCoupon)(body.code, body.cart_total, req.user?.id ?? null);
    return (0, ApiResponse_1.ok)(res, result, 'Coupon is valid');
});
exports.exportCouponsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const format = req.query.format === 'json' ? 'json' : 'csv';
    const file = await (0, coupon_service_1.exportCoupons)((0, pagination_1.parseListQuery)(req), format);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    return res.send(file.body);
});
//# sourceMappingURL=coupon.controller.js.map