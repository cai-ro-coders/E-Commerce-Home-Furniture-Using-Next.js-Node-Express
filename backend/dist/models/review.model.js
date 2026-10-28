"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReviews = listReviews;
exports.listApprovedReviewsForProduct = listApprovedReviewsForProduct;
exports.countApprovedReviewsForProduct = countApprovedReviewsForProduct;
exports.findReviewById = findReviewById;
exports.userReviewedProduct = userReviewedProduct;
exports.createReview = createReview;
exports.updateReview = updateReview;
exports.deleteReview = deleteReview;
exports.reviewStats = reviewStats;
exports.ratingBreakdown = ratingBreakdown;
const database_1 = require("../config/database");
const pagination_1 = require("../utils/pagination");
/** Logical sort field -> SQL expression (aliases live on the joined tables). */
const SORTABLE = {
    id: 'r.id',
    rating: 'r.rating',
    status: 'r.status',
    created_at: 'r.created_at',
    product_name: 'p.name',
    user_name: 'u.full_name',
};
const REVIEW_SELECT = `
  SELECT r.*,
         p.name  AS product_name,
         p.slug  AS product_slug,
         (SELECT pi.image FROM product_images pi WHERE pi.product_id = p.id
           ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS product_image,
         u.full_name AS user_name,
         u.email     AS user_email,
         u.avatar    AS user_avatar
    FROM reviews r
    JOIN products p ON p.id = r.product_id
    JOIN users u    ON u.id = r.user_id`;
async function listReviews(filters) {
    const where = [];
    const params = [];
    const search = (0, pagination_1.buildSearchFilter)(filters.search, ['r.title', 'r.comment', 'p.name', 'u.full_name']);
    if (search.clause) {
        where.push(search.clause);
        params.push(...search.params);
    }
    if (filters.status) {
        where.push('r.status = ?');
        params.push(filters.status);
    }
    if (filters.product_id) {
        where.push('r.product_id = ?');
        params.push(filters.product_id);
    }
    if (filters.rating) {
        where.push('r.rating = ?');
        params.push(filters.rating);
    }
    const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const sortColumn = (0, pagination_1.safeSortExpression)(filters.sortBy, SORTABLE, 'id');
    const direction = filters.sortDir === 'asc' ? 'ASC' : 'DESC';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM reviews r
       JOIN products p ON p.id = r.product_id
       JOIN users u ON u.id = r.user_id ${whereSql}`, params);
    const total = Number(countRow?.total ?? 0);
    const rows = await (0, database_1.query)(`${REVIEW_SELECT}${whereSql} ORDER BY ${sortColumn} ${direction}, r.id DESC LIMIT ? OFFSET ?`, [...params, filters.pageSize, (filters.page - 1) * filters.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, total, filters.page, filters.pageSize);
}
/** Public storefront endpoint — only approved reviews, with the author's name. */
async function listApprovedReviewsForProduct(productId, limit = 20, offset = 0) {
    return (0, database_1.query)(`SELECT r.id, r.rating, r.title, r.comment, r.created_at, u.full_name AS user_name, u.avatar AS user_avatar
       FROM reviews r
       JOIN users u ON u.id = r.user_id
      WHERE r.product_id = ? AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`, [productId, limit, offset]);
}
async function countApprovedReviewsForProduct(productId) {
    const row = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM reviews WHERE product_id = ? AND status = 'approved'`, [productId]);
    return Number(row?.total ?? 0);
}
async function findReviewById(id) {
    return (0, database_1.queryOne)(`${REVIEW_SELECT} WHERE r.id = ? LIMIT 1`, [id]);
}
async function userReviewedProduct(userId, productId) {
    const row = await (0, database_1.queryOne)('SELECT id FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1', [userId, productId]);
    return row !== null;
}
const REVIEW_FIELDS = ['rating', 'title', 'comment', 'status'];
async function createReview(data) {
    const result = await (0, database_1.execute)('INSERT INTO reviews (product_id, user_id, rating, title, comment, status) VALUES (?, ?, ?, ?, ?, ?)', [data.product_id, data.user_id, data.rating, data.title ?? null, data.comment ?? null, data.status ?? 'pending']);
    return result.insertId;
}
async function updateReview(id, data) {
    const entries = Object.entries(data).filter(([key, value]) => REVIEW_FIELDS.includes(key) && value !== undefined);
    if (entries.length === 0)
        return false;
    const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const result = await (0, database_1.execute)(`UPDATE reviews SET ${setSql} WHERE id = ?`, [
        ...entries.map(([, value]) => value),
        id,
    ]);
    return result.affectedRows > 0;
}
async function deleteReview(id) {
    const result = await (0, database_1.execute)('DELETE FROM reviews WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
async function reviewStats() {
    return ((await (0, database_1.queryOne)(`
      SELECT COUNT(*)                                          AS total,
             COALESCE(SUM(status = 'pending'), 0)               AS pending,
             COALESCE(SUM(status = 'approved'), 0)              AS approved,
             COALESCE(SUM(status = 'rejected'), 0)              AS rejected,
             COALESCE(ROUND(AVG(rating), 2), 0)                 AS average_rating
        FROM reviews
    `)) ?? {});
}
/** Rating distribution (5★→1★) for the product detail page. */
async function ratingBreakdown(productId) {
    const rows = await (0, database_1.query)(`SELECT rating, COUNT(*) AS total
       FROM reviews
      WHERE product_id = ? AND status = 'approved'
      GROUP BY rating
      ORDER BY rating DESC`, [productId]);
    const map = new Map(rows.map((row) => [Number(row.rating), Number(row.total)]));
    return [5, 4, 3, 2, 1].map((rating) => ({ rating, total: map.get(rating) ?? 0 }));
}
//# sourceMappingURL=review.model.js.map