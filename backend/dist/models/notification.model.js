"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotifications = listNotifications;
exports.unreadCount = unreadCount;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.deleteNotification = deleteNotification;
exports.createNotification = createNotification;
exports.notifyStaff = notifyStaff;
const database_1 = require("../config/database");
/**
 * Notifications addressed to a user, plus broadcast notifications (user_id IS
 * NULL) that staff and admins all see.
 */
async function listNotifications(userId, limit = 20, onlyUnread = false) {
    const readFilter = onlyUnread ? 'AND n.read_at IS NULL' : '';
    return (0, database_1.query)(`SELECT n.* FROM notifications n
      WHERE (n.user_id = ? OR n.user_id IS NULL) ${readFilter}
      ORDER BY n.read_at IS NOT NULL ASC, n.created_at DESC
      LIMIT ?`, [userId, limit]);
}
async function unreadCount(userId) {
    const row = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM notifications
      WHERE (user_id = ? OR user_id IS NULL) AND read_at IS NULL`, [userId]);
    return Number(row?.total ?? 0);
}
async function markRead(id, userId) {
    const result = await (0, database_1.execute)('UPDATE notifications SET read_at = NOW() WHERE id = ? AND (user_id = ? OR user_id IS NULL)', [id, userId]);
    return result.affectedRows > 0;
}
async function markAllRead(userId) {
    const result = await (0, database_1.execute)('UPDATE notifications SET read_at = NOW() WHERE (user_id = ? OR user_id IS NULL) AND read_at IS NULL', [userId]);
    return result.affectedRows;
}
async function deleteNotification(id, userId) {
    const result = await (0, database_1.execute)('DELETE FROM notifications WHERE id = ? AND (user_id = ? OR user_id IS NULL)', [id, userId]);
    return result.affectedRows > 0;
}
async function createNotification(data) {
    const result = await (0, database_1.execute)('INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)', [data.user_id ?? null, data.title, data.message, data.type ?? 'info', data.link ?? null]);
    return result.insertId;
}
/**
 * Notify every back-office user. Called when a customer places an order, leaves
 * a review, stock runs low, etc.
 */
async function notifyStaff(data) {
    const result = await (0, database_1.execute)(`INSERT INTO notifications (user_id, title, message, type, link)
     SELECT u.id, ?, ?, ?, ? FROM users u WHERE u.role IN ('admin', 'staff') AND u.status = 'active'`, [data.title, data.message, data.type ?? 'info', data.link ?? null]);
    if (result.affectedRows === 0)
        return;
}
//# sourceMappingURL=notification.model.js.map