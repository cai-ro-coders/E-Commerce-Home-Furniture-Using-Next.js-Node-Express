"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastHandler = exports.deleteNotificationHandler = exports.readAllNotificationsHandler = exports.readNotificationHandler = exports.unreadCountHandler = exports.listNotificationsHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const notification_service_1 = require("../services/notification.service");
const userId = (req) => req.user.id;
exports.listNotificationsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const onlyUnread = req.query.unread === 'true' || req.query.unread === '1';
    return (0, ApiResponse_1.ok)(res, await (0, notification_service_1.getNotifications)(userId(req), limit, onlyUnread));
});
exports.unreadCountHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, notification_service_1.getUnreadCount)(userId(req)));
});
exports.readNotificationHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        return (0, ApiResponse_1.ok)(res, await (0, notification_service_1.readNotification)(Number(req.params.id), userId(req)));
    }
    catch (error) {
        if (error instanceof Error && error.message === 'NOT_FOUND') {
            throw ApiError_1.ApiError.notFound('Notification not found');
        }
        throw error;
    }
});
exports.readAllNotificationsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, notification_service_1.readAllNotifications)(userId(req)), 'All notifications marked as read');
});
exports.deleteNotificationHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        await (0, notification_service_1.removeNotification)(Number(req.params.id), userId(req));
    }
    catch (error) {
        if (error instanceof Error && error.message === 'NOT_FOUND') {
            throw ApiError_1.ApiError.notFound('Notification not found');
        }
        throw error;
    }
    return (0, ApiResponse_1.noContent)(res);
});
/** Staff broadcast. The same row is the in-app message; email/SMS are queued off this record. */
exports.broadcastHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const result = await (0, notification_service_1.sendNotification)({
        user_id: req.user.id,
        title: body.title,
        message: body.message,
        type: body.type ?? 'info',
    });
    return (0, ApiResponse_1.created)(res, result, 'Notification sent');
});
//# sourceMappingURL=notification.controller.js.map