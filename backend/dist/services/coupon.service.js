"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCouponByCode = void 0;
exports.getCoupons = getCoupons;
exports.getCoupon = getCoupon;
exports.getCouponUsages = getCouponUsages;
exports.createNewCoupon = createNewCoupon;
exports.updateExistingCoupon = updateExistingCoupon;
exports.removeCoupon = removeCoupon;
exports.checkCoupon = checkCoupon;
exports.exportCoupons = exportCoupons;
const ApiError_1 = require("../utils/ApiError");
const csv_1 = require("../utils/csv");
const coupon_model_1 = require("../models/coupon.model");
Object.defineProperty(exports, "findCouponByCode", { enumerable: true, get: function () { return coupon_model_1.findCouponByCode; } });
async function getCoupons(list) {
    return (0, coupon_model_1.listCoupons)(list);
}
async function getCoupon(id) {
    const coupon = await (0, coupon_model_1.findCouponById)(id);
    if (!coupon)
        throw ApiError_1.ApiError.notFound('Coupon not found');
    return coupon;
}
/** Redemption history for one coupon, newest first — the detail drawer's tab. */
async function getCouponUsages(id, list) {
    const coupon = await (0, coupon_model_1.findCouponById)(id);
    if (!coupon)
        throw ApiError_1.ApiError.notFound('Coupon not found');
    return (0, coupon_model_1.listCouponUsages)(id, list);
}
async function createNewCoupon(data) {
    const code = String(data.code).toUpperCase();
    if (await (0, coupon_model_1.codeExists)(code))
        throw ApiError_1.ApiError.conflict('A coupon with that code already exists');
    const id = await (0, coupon_model_1.createCoupon)({
        code,
        type: data.type,
        value: Number(data.value),
        minimum_order: Number(data.minimum_order ?? 0),
        maximum_discount: data.maximum_discount === undefined || data.maximum_discount === null
            ? null
            : Number(data.maximum_discount),
        usage_limit: data.usage_limit === undefined || data.usage_limit === null ? null : Number(data.usage_limit),
        start_date: toMysqlDateTime(data.start_date),
        end_date: toMysqlDateTime(data.end_date),
        status: data.status ?? 'active',
    });
    return (0, coupon_model_1.findCouponById)(id);
}
async function updateExistingCoupon(id, data) {
    const existing = await (0, coupon_model_1.findCouponById)(id);
    if (!existing)
        throw ApiError_1.ApiError.notFound('Coupon not found');
    if (data.code) {
        const code = String(data.code).toUpperCase();
        if (code !== existing.code && (await (0, coupon_model_1.codeExists)(code, id))) {
            throw ApiError_1.ApiError.conflict('A coupon with that code already exists');
        }
        data.code = code;
    }
    const patch = {};
    if (data.code !== undefined)
        patch.code = data.code;
    if (data.type !== undefined)
        patch.type = data.type;
    if (data.value !== undefined)
        patch.value = Number(data.value);
    if (data.minimum_order !== undefined)
        patch.minimum_order = Number(data.minimum_order);
    if (data.maximum_discount !== undefined) {
        patch.maximum_discount = data.maximum_discount === null ? null : Number(data.maximum_discount);
    }
    if (data.usage_limit !== undefined) {
        patch.usage_limit = data.usage_limit === null ? null : Number(data.usage_limit);
    }
    if (data.start_date !== undefined)
        patch.start_date = toMysqlDateTime(data.start_date);
    if (data.end_date !== undefined)
        patch.end_date = toMysqlDateTime(data.end_date);
    if (data.status !== undefined)
        patch.status = data.status;
    // Validate the merged window rather than the partial patch.
    const start = patch.start_date
        ? new Date(patch.start_date.replace(' ', 'T'))
        : new Date(existing.start_date.replace(' ', 'T'));
    const end = patch.end_date
        ? new Date(patch.end_date.replace(' ', 'T'))
        : new Date(existing.end_date.replace(' ', 'T'));
    if (end < start)
        throw ApiError_1.ApiError.badRequest('End date must be after the start date');
    await (0, coupon_model_1.updateCoupon)(id, patch);
    return (0, coupon_model_1.findCouponById)(id);
}
async function removeCoupon(id) {
    const coupon = await (0, coupon_model_1.findCouponById)(id);
    if (!coupon)
        throw ApiError_1.ApiError.notFound('Coupon not found');
    await (0, coupon_model_1.deleteCoupon)(id);
    return true;
}
/** Public: validate a coupon against the caller's cart total. */
async function checkCoupon(code, cartTotal, userId) {
    return (0, coupon_model_1.evaluateCoupon)(code, cartTotal, userId);
}
async function exportCoupons(list, format) {
    const result = await (0, coupon_model_1.listCoupons)({ ...list, page: 1, pageSize: 10000 });
    if (format === 'json') {
        return {
            body: JSON.stringify(result.data, null, 2),
            mimeType: 'application/json',
            filename: `coupons-export-${Date.now()}.json`,
        };
    }
    const csv = (0, csv_1.toCsv)(result.data, [
        { key: 'id', header: 'ID' },
        { key: 'code', header: 'Code' },
        { key: 'type', header: 'Type' },
        { key: 'value', header: 'Value' },
        { key: 'minimum_order', header: 'Min Order' },
        { key: 'maximum_discount', header: 'Max Discount' },
        { key: 'usage_limit', header: 'Usage Limit' },
        { key: 'used_count', header: 'Used' },
        { key: 'start_date', header: 'Start Date' },
        { key: 'end_date', header: 'End Date' },
        { key: 'status', header: 'Status' },
    ]);
    return { body: csv, mimeType: 'text/csv; charset=utf-8', filename: `coupons-export-${Date.now()}.csv` };
}
/** Normalise whatever the client sent (ISO string, Date) into MySQL DATETIME. */
function toMysqlDateTime(value) {
    if (value instanceof Date) {
        return value.toISOString().slice(0, 19).replace('T', ' ');
    }
    const parsed = new Date(String(value));
    if (Number.isNaN(parsed.getTime()))
        throw ApiError_1.ApiError.badRequest('Invalid date');
    return parsed.toISOString().slice(0, 19).replace('T', ' ');
}
//# sourceMappingURL=coupon.service.js.map