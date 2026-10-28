"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviews = getReviews;
exports.getReview = getReview;
exports.getProductReviews = getProductReviews;
exports.createNewReview = createNewReview;
exports.updateExistingReview = updateExistingReview;
exports.removeReview = removeReview;
exports.getReviewStats = getReviewStats;
exports.exportReviews = exportReviews;
const database_1 = require("../config/database");
const ApiError_1 = require("../utils/ApiError");
const csv_1 = require("../utils/csv");
const review_model_1 = require("../models/review.model");
const notification_model_1 = require("../models/notification.model");
async function getReviews(filters) {
    return (0, review_model_1.listReviews)(filters);
}
async function getReview(id) {
    const review = await (0, review_model_1.findReviewById)(id);
    if (!review)
        throw ApiError_1.ApiError.notFound('Review not found');
    return review;
}
/** Public storefront endpoint for a product's approved reviews. */
async function getProductReviews(productId, page = 1, pageSize = 10) {
    const [reviews, total, breakdown] = await Promise.all([
        (0, review_model_1.listApprovedReviewsForProduct)(productId, pageSize, (page - 1) * pageSize),
        (0, review_model_1.countApprovedReviewsForProduct)(productId),
        (0, review_model_1.ratingBreakdown)(productId),
    ]);
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
    return {
        data: reviews,
        meta: {
            page,
            pageSize,
            total,
            totalPages,
            from: total === 0 ? 0 : (page - 1) * pageSize + 1,
            to: total === 0 ? 0 : Math.min(page * pageSize, total),
        },
        breakdown,
    };
}
async function createNewReview(data, userId) {
    const product = await (0, database_1.query)('SELECT id, name FROM products WHERE id = ? LIMIT 1', [data.product_id]);
    if (product.length === 0)
        throw ApiError_1.ApiError.notFound('Product not found');
    if (await (0, review_model_1.userReviewedProduct)(userId, data.product_id)) {
        throw ApiError_1.ApiError.conflict('You have already reviewed this product');
    }
    // Only customers who actually bought the product may review it.
    const purchased = await (0, database_1.query)(`SELECT oi.id
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = ? AND o.user_id = ? AND o.order_status = 'Delivered'
      LIMIT 1`, [data.product_id, userId]);
    if (purchased.length === 0) {
        throw ApiError_1.ApiError.forbidden('Only customers who received this product can review it');
    }
    const id = await (0, review_model_1.createReview)({
        product_id: data.product_id,
        user_id: userId,
        rating: data.rating,
        title: data.title ?? null,
        comment: data.comment ?? null,
        status: 'pending',
    });
    await (0, notification_model_1.notifyStaff)({
        title: 'New review awaiting moderation',
        message: `${product[0].name} has a new ${data.rating}★ review.`,
        type: 'info',
        link: '/admin/reviews',
    });
    return (0, review_model_1.findReviewById)(id);
}
async function updateExistingReview(id, data) {
    const review = await (0, review_model_1.findReviewById)(id);
    if (!review)
        throw ApiError_1.ApiError.notFound('Review not found');
    const patch = {};
    if (data.rating !== undefined)
        patch.rating = Number(data.rating);
    if (data.title !== undefined)
        patch.title = data.title === null ? null : String(data.title);
    if (data.comment !== undefined)
        patch.comment = data.comment === null ? null : String(data.comment);
    if (data.status !== undefined)
        patch.status = data.status;
    await (0, review_model_1.updateReview)(id, patch);
    // Tell the author when a moderator acts on their review.
    if (data.status && data.status !== review.status) {
        await (0, notification_model_1.createNotification)({
            user_id: review.user_id,
            title: 'Review updated',
            message: `Your review of "${review.product_name}" is now ${data.status}.`,
            type: data.status === 'approved' ? 'success' : 'warning',
            link: '/account',
        });
    }
    // Re-read so the response reflects the new status; fall back to the pre-update
    // row if the record vanished between the UPDATE and the re-read.
    const updated = await (0, review_model_1.findReviewById)(id);
    return updated ?? review;
}
async function removeReview(id) {
    const review = await (0, review_model_1.findReviewById)(id);
    if (!review)
        throw ApiError_1.ApiError.notFound('Review not found');
    await (0, review_model_1.deleteReview)(id);
    return true;
}
async function getReviewStats() {
    return (0, review_model_1.reviewStats)();
}
async function exportReviews(filters, format) {
    const result = await (0, review_model_1.listReviews)({ ...filters, page: 1, pageSize: 10000 });
    if (format === 'json') {
        return {
            body: JSON.stringify(result.data, null, 2),
            mimeType: 'application/json',
            filename: `reviews-export-${Date.now()}.json`,
        };
    }
    const csv = (0, csv_1.toCsv)(result.data, [
        { key: 'id', header: 'ID' },
        { key: 'product_name', header: 'Product' },
        { key: 'user_name', header: 'Customer' },
        { key: 'user_email', header: 'Email' },
        { key: 'rating', header: 'Rating' },
        { key: 'title', header: 'Title' },
        { key: 'comment', header: 'Comment' },
        { key: 'status', header: 'Status' },
        { key: 'created_at', header: 'Date' },
    ]);
    return { body: csv, mimeType: 'text/csv; charset=utf-8', filename: `reviews-export-${Date.now()}.csv` };
}
//# sourceMappingURL=review.service.js.map