"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReviewsHandler = exports.deleteReviewHandler = exports.moderateReviewHandler = exports.updateReviewHandler = exports.createReviewHandler = exports.productReviewsHandler = exports.getReviewHandler = exports.reviewStatsHandler = exports.listReviewsHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const pagination_1 = require("../utils/pagination");
const ApiError_1 = require("../utils/ApiError");
const review_service_1 = require("../services/review.service");
function reviewFilters(req) {
    const list = (0, pagination_1.parseListQuery)(req);
    const q = req.query;
    const num = (key) => q[key] === undefined || q[key] === '' ? undefined : Number(q[key]);
    return {
        ...list,
        status: q.status || undefined,
        productId: num('product_id'),
        rating: num('rating'),
    };
}
exports.listReviewsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.paginated)(res, await (0, review_service_1.getReviews)(reviewFilters(req)));
});
exports.reviewStatsHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, review_service_1.getReviewStats)());
});
exports.getReviewHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, review_service_1.getReview)(Number(req.params.id)));
});
exports.productReviewsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 10)));
    return (0, ApiResponse_1.paginated)(res, await (0, review_service_1.getProductReviews)(Number(req.params.id), page, pageSize));
});
exports.createReviewHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const record = await (0, review_service_1.createNewReview)(req.body, req.user.id);
    return (0, ApiResponse_1.created)(res, { id: record.id }, 'Thanks for your review — it is awaiting moderation.');
});
exports.updateReviewHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const review = await (0, review_service_1.updateExistingReview)(Number(req.params.id), req.body);
    return (0, ApiResponse_1.ok)(res, review, 'Review updated');
});
/** Approve/reject is a moderation action, so the status-only route is separate. */
exports.moderateReviewHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const status = req.body.status;
    const review = await (0, review_service_1.updateExistingReview)(Number(req.params.id), { status });
    return (0, ApiResponse_1.ok)(res, review, `Review marked as ${review.status}`);
});
exports.deleteReviewHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    if (req.user.role === 'customer') {
        const review = await (0, review_service_1.getReview)(id);
        if (!review || review.user_id !== req.user.id) {
            throw ApiError_1.ApiError.forbidden('You can only delete your own review');
        }
    }
    await (0, review_service_1.removeReview)(id);
    return (0, ApiResponse_1.noContent)(res);
});
exports.exportReviewsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const format = req.query.format === 'json' ? 'json' : 'csv';
    const file = await (0, review_service_1.exportReviews)(reviewFilters(req), format);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    return res.send(file.body);
});
//# sourceMappingURL=review.controller.js.map