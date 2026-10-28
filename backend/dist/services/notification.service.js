"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.getUnreadCount = getUnreadCount;
exports.readNotification = readNotification;
exports.readAllNotifications = readAllNotifications;
exports.removeNotification = removeNotification;
exports.sendNotification = sendNotification;
const notification_model_1 = require("../models/notification.model");
async function getNotifications(userId, limit, onlyUnread) {
    const [items, unread] = await Promise.all([
        (0, notification_model_1.listNotifications)(userId, limit, onlyUnread),
        (0, notification_model_1.unreadCount)(userId),
    ]);
    return { items, unread_count: unread };
}
async function getUnreadCount(userId) {
    return { unread_count: await (0, notification_model_1.unreadCount)(userId) };
}
async function readNotification(id, userId) {
    const done = await (0, notification_model_1.markRead)(id, userId);
    if (!done)
        throw new Error('NOT_FOUND');
    return { read: true };
}
async function readAllNotifications(userId) {
    const count = await (0, notification_model_1.markAllRead)(userId);
    return { marked_read: count };
}
async function removeNotification(id, userId) {
    const done = await (0, notification_model_1.deleteNotification)(id, userId);
    if (!done)
        throw new Error('NOT_FOUND');
    return { deleted: true };
}
async function sendNotification(data) {
    const id = await (0, notification_model_1.createNotification)(data);
    return { id };
}
//# sourceMappingURL=notification.service.js.map