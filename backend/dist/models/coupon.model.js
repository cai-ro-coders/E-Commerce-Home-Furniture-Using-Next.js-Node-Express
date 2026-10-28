"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCoupons = listCoupons;
exports.findCouponById = findCouponById;
exports.findCouponByCode = findCouponByCode;
exports.codeExists = codeExists;
exports.createCoupon = createCoupon;
exports.updateCoupon = updateCoupon;
exports.deleteCoupon = deleteCoupon;
exports.listCouponUsages = listCouponUsages;
exports.evaluateCoupon = evaluateCoupon;
const database_1 = require("../config/database");
const pagination_1 = require("../utils/pagination");
const SORTABLE = [
    'id',
    'code',
    'type',
    'value',
    'used_count',
    'usage_limit',
    'start_date',
    'end_date',
    'status',
    'created_at',
];
async function listCoupons(list) {
    const where = [];
    const params = [];
    const search = (0, pagination_1.buildSearchFilter)(list.search, ['code']);
    if (search.clause) {
        where.push(search.clause);
        params.push(...search.params);
    }
    if (list.filters.status) {
        where.push('status = ?');
        params.push(list.filters.status);
    }
    if (list.filters.type) {
        where.push('type = ?');
        params.push(list.filters.type);
    }
    const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const sortColumn = (0, pagination_1.safeSort)(list.sortBy, [...SORTABLE], 'id');
    const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM coupons ${whereSql}`, params);
    const total = Number(countRow?.total ?? 0);
    const rows = await (0, database_1.query)(`SELECT *,
            CASE WHEN usage_limit IS NULL OR usage_limit = 0 THEN NULL
                 ELSE ROUND(used_count * 100 / usage_limit, 1) END AS usage_percent,
            (status = 'active' AND start_date <= NOW() AND end_date >= NOW()) AS is_valid
       FROM coupons
       ${whereSql}
      ORDER BY ${sortColumn} ${direction}, id DESC
      LIMIT ? OFFSET ?`, [...params, list.pageSize, (list.page - 1) * list.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, total, list.page, list.pageSize);
}
async function findCouponById(id) {
    return (0, database_1.queryOne)('SELECT * FROM coupons WHERE id = ? LIMIT 1', [id]);
}
async function findCouponByCode(code) {
    return (0, database_1.queryOne)('SELECT * FROM coupons WHERE code = ? LIMIT 1', [code]);
}
async function codeExists(code, excludeId) {
    const row = excludeId
        ? await (0, database_1.queryOne)('SELECT id FROM coupons WHERE code = ? AND id <> ? LIMIT 1', [
            code,
            excludeId,
        ])
        : await (0, database_1.queryOne)('SELECT id FROM coupons WHERE code = ? LIMIT 1', [code]);
    return row !== null;
}
const COUPON_FIELDS = [
    'code',
    'type',
    'value',
    'minimum_order',
    'maximum_discount',
    'usage_limit',
    'used_count',
    'start_date',
    'end_date',
    'status',
];
async function createCoupon(data) {
    const result = await (0, database_1.execute)(`INSERT INTO coupons (code, type, value, minimum_order, maximum_discount, usage_limit, start_date, end_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        data.code,
        data.type,
        data.value,
        data.minimum_order ?? 0,
        data.maximum_discount ?? null,
        data.usage_limit ?? null,
        data.start_date,
        data.end_date,
        data.status ?? 'active',
    ]);
    return result.insertId;
}
async function updateCoupon(id, data) {
    const entries = Object.entries(data).filter(([key, value]) => COUPON_FIELDS.includes(key) && value !== undefined);
    if (entries.length === 0)
        return false;
    const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const result = await (0, database_1.execute)(`UPDATE coupons SET ${setSql} WHERE id = ?`, [
        ...entries.map(([, value]) => value),
        id,
    ]);
    return result.affectedRows > 0;
}
async function deleteCoupon(id) {
    const result = await (0, database_1.execute)('DELETE FROM coupons WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
/** Redemption history for one coupon, newest first. */
async function listCouponUsages(couponId, list) {
    const search = (0, pagination_1.buildSearchFilter)(list.search, ['u.full_name', 'u.email', 'o.order_number']);
    const where = ['cu.coupon_id = ?'];
    const params = [couponId];
    if (search.clause) {
        where.push(search.clause);
        params.push(...search.params);
    }
    const whereSql = `WHERE ${where.join(' AND ')}`;
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total
       FROM coupon_usages cu
       LEFT JOIN users u ON u.id = cu.user_id
       LEFT JOIN orders o ON o.id = cu.order_id
       ${whereSql}`, params);
    const rows = await (0, database_1.query)(`SELECT cu.id, cu.coupon_id, cu.user_id, cu.order_id, cu.discount_amount, cu.created_at,
            u.full_name   AS customer_name,
            u.email       AS customer_email,
            o.order_number
       FROM coupon_usages cu
       LEFT JOIN users u ON u.id = cu.user_id
       LEFT JOIN orders o ON o.id = cu.order_id
       ${whereSql}
      ORDER BY cu.created_at DESC, cu.id DESC
      LIMIT ? OFFSET ?`, [...params, list.pageSize, (list.page - 1) * list.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, Number(countRow?.total ?? 0), list.page, list.pageSize);
}
/**
 * Evaluate a coupon against a cart total. Returns a `valid: false` result with
 * a human-readable reason instead of throwing, so the checkout UI can show the
 * reason inline.
 */
async function evaluateCoupon(code, cartTotal, userId) {
    const coupon = await findCouponByCode(code);
    if (!coupon) {
        return { valid: false, reason: 'Coupon code not found', discount: 0, type: 'fixed', value: 0, description: '' };
    }
    const now = Date.now();
    const start = new Date(coupon.start_date.replace(' ', 'T')).getTime();
    const end = new Date(coupon.end_date.replace(' ', 'T')).getTime();
    if (coupon.status !== 'active') {
        return { valid: false, reason: 'This coupon is not active', discount: 0, type: coupon.type, value: Number(coupon.value), description: '' };
    }
    if (now < start) {
        return { valid: false, reason: 'This coupon is not valid yet', discount: 0, type: coupon.type, value: Number(coupon.value), description: '' };
    }
    if (now > end) {
        return { valid: false, reason: 'This coupon has expired', discount: 0, type: coupon.type, value: Number(coupon.value), description: '' };
    }
    if (cartTotal < Number(coupon.minimum_order)) {
        return {
            valid: false,
            reason: `Minimum order of ${coupon.minimum_order} required`,
            discount: 0,
            type: coupon.type,
            value: Number(coupon.value),
            description: '',
        };
    }
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
        return { valid: false, reason: 'This coupon has reached its usage limit', discount: 0, type: coupon.type, value: Number(coupon.value), description: '' };
    }
    if (userId) {
        const used = await (0, database_1.queryOne)('SELECT id FROM coupon_usages WHERE coupon_id = ? AND user_id = ? LIMIT 1', [coupon.id, userId]);
        if (used) {
            return { valid: false, reason: 'You have already used this coupon', discount: 0, type: coupon.type, value: Number(coupon.value), description: '' };
        }
    }
    let discount = coupon.type === 'percentage'
        ? (cartTotal * Number(coupon.value)) / 100
        : Number(coupon.value);
    if (coupon.maximum_discount !== null) {
        discount = Math.min(discount, Number(coupon.maximum_discount));
    }
    discount = Math.round(Math.max(0, Math.min(discount, cartTotal)) * 100) / 100;
    return {
        valid: true,
        discount,
        type: coupon.type,
        value: Number(coupon.value),
        description: coupon.type === 'percentage'
            ? `${coupon.value}% off${coupon.maximum_discount ? ` (max ${coupon.maximum_discount})` : ''}`
            : `${coupon.value} off`,
    };
}
//# sourceMappingURL=coupon.model.js.map