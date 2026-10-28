"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.emailExists = emailExists;
exports.listUsers = listUsers;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.recordSuccessfulLogin = recordSuccessfulLogin;
exports.writeLoginHistory = writeLoginHistory;
exports.listLoginHistory = listLoginHistory;
exports.listActivityLog = listActivityLog;
exports.listAddressesByUser = listAddressesByUser;
exports.findAddressById = findAddressById;
exports.createAddress = createAddress;
exports.updateAddress = updateAddress;
exports.deleteAddress = deleteAddress;
exports.getCustomerOrderSummary = getCustomerOrderSummary;
exports.deleteCustomerWithData = deleteCustomerWithData;
const database_1 = require("../config/database");
const pagination_1 = require("../utils/pagination");
/** Logical sort field -> SQL expression (counts/spend are SELECT subquery aliases). */
const SORTABLE = {
    id: 'u.id',
    full_name: 'u.full_name',
    email: 'u.email',
    role: 'u.role',
    status: 'u.status',
    last_login_at: 'u.last_login_at',
    created_at: 'u.created_at',
    order_count: 'order_count',
    total_spent: 'total_spent',
};
async function findUserByEmail(email) {
    return (0, database_1.queryOne)('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
}
async function findUserById(id, withPassword = false) {
    const columns = withPassword
        ? '*'
        : 'id, full_name, email, phone, avatar, role, status, email_verified, last_login_at, last_login_ip, created_at, updated_at';
    return (0, database_1.queryOne)(`SELECT ${columns} FROM users WHERE id = ? LIMIT 1`, [id]);
}
async function emailExists(email, excludeId) {
    const row = excludeId
        ? await (0, database_1.queryOne)('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1', [
            email,
            excludeId,
        ])
        : await (0, database_1.queryOne)('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    return row !== null;
}
async function listUsers(list) {
    const where = [];
    const params = [];
    const search = (0, pagination_1.buildSearchFilter)(list.search, ['u.full_name', 'u.email', 'u.phone']);
    if (search.clause) {
        where.push(search.clause);
        params.push(...search.params);
    }
    if (list.filters.role) {
        where.push('u.role = ?');
        params.push(list.filters.role);
    }
    if (list.filters.status) {
        where.push('u.status = ?');
        params.push(list.filters.status);
    }
    const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const sortColumn = (0, pagination_1.safeSortExpression)(list.sortBy, SORTABLE, 'id');
    const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM users u ${whereSql}`, params);
    const total = Number(countRow?.total ?? 0);
    const rows = await (0, database_1.query)(`SELECT u.id, u.full_name, u.email, u.phone, u.avatar, u.role, u.status,
            u.email_verified, u.last_login_at, u.created_at, u.updated_at,
            (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id)                       AS order_count,
            (SELECT COALESCE(SUM(o.grand_total), 0) FROM orders o
              WHERE o.user_id = u.id AND o.payment_status = 'Paid')                       AS total_spent,
            (SELECT COUNT(*) FROM addresses a WHERE a.user_id = u.id)                     AS address_count,
            (SELECT COUNT(*) FROM reviews r WHERE r.user_id = u.id)                       AS review_count
       FROM users u
       ${whereSql}
      ORDER BY ${sortColumn} ${direction}, u.id DESC
      LIMIT ? OFFSET ?`, [...params, list.pageSize, (list.page - 1) * list.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, total, list.page, list.pageSize);
}
async function createUser(data) {
    const result = await (0, database_1.execute)(`INSERT INTO users (full_name, email, password, phone, avatar, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        data.full_name,
        data.email,
        data.password,
        data.phone ?? null,
        data.avatar ?? null,
        data.role,
        data.status,
    ]);
    return result.insertId;
}
const UPDATABLE = new Set([
    'full_name',
    'email',
    'password',
    'phone',
    'avatar',
    'role',
    'status',
    'email_verified',
]);
async function updateUser(id, data) {
    const entries = Object.entries(data).filter(([key, value]) => UPDATABLE.has(key) && value !== undefined);
    if (entries.length === 0)
        return false;
    // Column names come from the hard-coded allow-list above; values are bound.
    const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const params = entries.map(([, value]) => value);
    const result = await (0, database_1.execute)(`UPDATE users SET ${setSql} WHERE id = ?`, [...params, id]);
    return result.affectedRows > 0;
}
async function deleteUser(id) {
    const result = await (0, database_1.execute)('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
async function recordSuccessfulLogin(id, ip) {
    await (0, database_1.execute)('UPDATE users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?', [
        ip,
        id,
    ]);
}
async function writeLoginHistory(data) {
    await (0, database_1.execute)(`INSERT INTO login_histories (user_id, email, success, reason, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`, [data.userId, data.email, data.success ? 1 : 0, data.reason ?? null, data.ip, data.userAgent]);
}
async function listLoginHistory(userId, limit = 20) {
    return (0, database_1.query)(`SELECT id, success, reason, ip_address, user_agent, created_at
       FROM login_histories
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?`, [userId, limit]);
}
async function listActivityLog(list) {
    const where = [];
    const params = [];
    if (list.filters.user_id) {
        where.push('a.user_id = ?');
        params.push(list.filters.user_id);
    }
    if (list.filters.action) {
        where.push('a.action = ?');
        params.push(list.filters.action);
    }
    const search = (0, pagination_1.buildSearchFilter)(list.search, ['a.description', 'a.action', 'a.entity', 'u.email']);
    if (search.clause) {
        where.push(search.clause);
        params.push(...search.params);
    }
    const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM user_activities a JOIN users u ON u.id = a.user_id ${whereSql}`, params);
    const total = Number(countRow?.total ?? 0);
    const rows = await (0, database_1.query)(`SELECT a.id, a.user_id, a.action, a.entity, a.entity_id, a.description,
            a.ip_address, a.created_at, u.full_name, u.email, u.avatar
       FROM user_activities a
       JOIN users u ON u.id = a.user_id
       ${whereSql}
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT ? OFFSET ?`, [...params, list.pageSize, (list.page - 1) * list.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, total, list.page, list.pageSize);
}
async function listAddressesByUser(userId) {
    return (0, database_1.query)(`SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC`, [userId]);
}
async function findAddressById(id) {
    return (0, database_1.queryOne)('SELECT * FROM addresses WHERE id = ? LIMIT 1', [id]);
}
async function createAddress(userId, data) {
    if (data.is_default) {
        await (0, database_1.execute)('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }
    const result = await (0, database_1.execute)(`INSERT INTO addresses (user_id, full_name, phone, address_line_1, address_line_2,
                            city, province, postal_code, country, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        userId,
        data.full_name,
        data.phone,
        data.address_line_1,
        data.address_line_2 ?? null,
        data.city,
        data.province ?? null,
        data.postal_code ?? null,
        data.country ?? 'Philippines',
        data.is_default ? 1 : 0,
    ]);
    return result.insertId;
}
async function updateAddress(id, data) {
    const fields = [
        'full_name',
        'phone',
        'address_line_1',
        'address_line_2',
        'city',
        'province',
        'postal_code',
        'country',
        'is_default',
    ];
    const entries = Object.entries(data).filter(([key, value]) => fields.includes(key) && value !== undefined);
    if (entries.length === 0)
        return false;
    if (data.is_default) {
        await (0, database_1.execute)('UPDATE addresses SET is_default = 0 WHERE user_id = (SELECT user_id FROM addresses WHERE id = ?)', [id]);
    }
    const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const result = await (0, database_1.execute)(`UPDATE addresses SET ${setSql} WHERE id = ?`, [
        ...entries.map(([, value]) => value),
        id,
    ]);
    return result.affectedRows > 0;
}
async function deleteAddress(id) {
    const result = await (0, database_1.execute)('DELETE FROM addresses WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
async function getCustomerOrderSummary(userId, limit = 10) {
    return (0, database_1.query)(`SELECT o.id, o.order_number, o.order_status, o.payment_status, o.grand_total,
            o.created_at,
            (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT ?`, [userId, limit]);
}
/**
 * Delete a customer and every record that belongs to them, in one transaction
 * so a failure halfway through cannot leave orphaned rows.
 * Orders are preserved (order_items.product_id is SET NULL, orders.user_id is
 * RESTRICT) — historical sales must survive a customer deletion.
 */
async function deleteCustomerWithData(userId) {
    return (0, database_1.transaction)(async (connection) => {
        await connection.execute('DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = ?)', [userId]);
        await connection.execute('DELETE FROM carts WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM wishlists WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM reviews WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM addresses WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM coupon_usages WHERE user_id = ?', [userId]);
        // Detach, do not delete, historical orders.
        await connection.execute('UPDATE orders SET shipping_address_id = NULL WHERE user_id = ?', [userId]);
        const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
        return result.affectedRows > 0;
    });
}
//# sourceMappingURL=user.model.js.map