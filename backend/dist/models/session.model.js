"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSessions = listSessions;
exports.listActiveSessions = listActiveSessions;
exports.revokeSession = revokeSession;
exports.revokeOtherSessions = revokeOtherSessions;
exports.hashOf = hashOf;
const database_1 = require("../config/database");
const pagination_1 = require("../utils/pagination");
const jwt_1 = require("../utils/jwt");
const SORTABLE = ['id', 'created_at', 'last_used_at', 'expires_at'];
/**
 * Active sessions for one account.
 *
 * `is_current` is resolved in SQL by comparing the stored hash with the hash of
 * the refresh cookie the caller actually presented, so the account page can mark
 * the "this device" row without shipping hashes to the browser.
 */
async function listSessions(userId, currentTokenHash, list) {
    const where = ['s.user_id = ?', 's.revoked_at IS NULL', 's.expires_at > NOW()'];
    const params = [userId];
    const search = (0, pagination_1.buildSearchFilter)(list.search, ['s.ip_address', 's.user_agent']);
    if (search.clause) {
        where.push(search.clause);
        params.push(...search.params);
    }
    const whereSql = `WHERE ${where.join(' AND ')}`;
    const sortColumn = (0, pagination_1.safeSort)(list.sortBy, [...SORTABLE], 'last_used_at');
    const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM sessions s ${whereSql}`, params);
    const rows = await (0, database_1.query)(`SELECT s.id, s.user_id, s.ip_address, s.user_agent, s.created_at,
            s.last_used_at, s.expires_at, s.revoked_at,
            (s.refresh_token_hash = ?) AS is_current
       FROM sessions s
       ${whereSql}
      ORDER BY s.${sortColumn} ${direction}
      LIMIT ? OFFSET ?`, [currentTokenHash ?? '\0', ...params, list.pageSize, (list.page - 1) * list.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, Number(countRow?.total ?? 0), list.page, list.pageSize);
}
/** Every non-revoked session, store-wide. Admin "who is online" view. */
async function listActiveSessions(list) {
    const where = ['s.revoked_at IS NULL', 's.expires_at > NOW()'];
    const params = [];
    const search = (0, pagination_1.buildSearchFilter)(list.search, ['u.full_name', 'u.email', 's.ip_address', 's.user_agent']);
    if (search.clause) {
        where.push(search.clause);
        params.push(...search.params);
    }
    if (list.filters.role) {
        where.push('u.role = ?');
        params.push(list.filters.role);
    }
    const whereSql = `WHERE ${where.join(' AND ')}`;
    const sortColumn = (0, pagination_1.safeSort)(list.sortBy, [...SORTABLE], 'last_used_at');
    const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM sessions s JOIN users u ON u.id = s.user_id ${whereSql}`, params);
    const rows = await (0, database_1.query)(`SELECT s.id, s.user_id, s.ip_address, s.user_agent, s.created_at,
            s.last_used_at, s.expires_at, s.revoked_at,
            u.full_name AS user_name, u.email AS user_email
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       ${whereSql}
      ORDER BY s.${sortColumn} ${direction}
      LIMIT ? OFFSET ?`, [...params, list.pageSize, (list.page - 1) * list.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, Number(countRow?.total ?? 0), list.page, list.pageSize);
}
/** Revoke a session, but only if it belongs to `userId` (or `null` for admins). */
async function revokeSession(id, userId) {
    const result = userId === null
        ? await (0, database_1.execute)('UPDATE sessions SET revoked_at = NOW() WHERE id = ? AND revoked_at IS NULL', [id])
        : await (0, database_1.execute)('UPDATE sessions SET revoked_at = NOW() WHERE id = ? AND user_id = ? AND revoked_at IS NULL', [id, userId]);
    return result.affectedRows > 0;
}
/** Sign a user out everywhere except the device that made the request. */
async function revokeOtherSessions(userId, currentTokenHash) {
    const result = await (0, database_1.execute)(`UPDATE sessions SET revoked_at = NOW()
      WHERE user_id = ? AND revoked_at IS NULL AND refresh_token_hash <> ?`, [userId, currentTokenHash]);
    return result.affectedRows;
}
function hashOf(token) {
    return token ? (0, jwt_1.sha256)(token) : null;
}
//# sourceMappingURL=session.model.js.map