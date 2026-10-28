"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const pagination_1 = require("../utils/pagination");
const common_validator_1 = require("../validators/common.validator");
const notification_controller_1 = require("../controllers/notification.controller");
const rbac_1 = require("../middleware/rbac");
const database_1 = require("../config/database");
const notification_model_1 = require("../models/notification.model");
const ApiError_1 = require("../utils/ApiError");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// The signed-in user's own bell menu.
router.get('/', notification_controller_1.listNotificationsHandler);
router.get('/unread-count', notification_controller_1.unreadCountHandler);
router.patch('/read-all', notification_controller_1.readAllNotificationsHandler);
router.patch('/:id/read', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), notification_controller_1.readNotificationHandler);
router.delete('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), notification_controller_1.deleteNotificationHandler);
/** Staff inbox: every notification addressed to a staff or admin account. */
router.get('/staff/all', rbac_1.requireStaff, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const list = (0, pagination_1.parseListQuery)(req);
    const where = ['n.user_id IN (SELECT id FROM users WHERE role IN (\'admin\', \'staff\'))'];
    const params = [];
    if (list.search) {
        where.push('(n.title LIKE ? OR n.message LIKE ?)');
        const like = `%${list.search.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
        params.push(like, like);
    }
    const whereSql = `WHERE ${where.join(' AND ')}`;
    const [count] = await (0, database_1.query)(`SELECT COUNT(*) AS total FROM notifications n ${whereSql}`, params);
    const total = Number(count?.total ?? 0);
    const rows = await (0, database_1.query)(`SELECT n.*, u.full_name AS recipient
         FROM notifications n
         LEFT JOIN users u ON u.id = n.user_id
         ${whereSql}
        ORDER BY n.id DESC
        LIMIT ? OFFSET ?`, [...params, list.pageSize, (list.page - 1) * list.pageSize]);
    return (0, ApiResponse_1.paginated)(res, {
        data: rows,
        meta: {
            page: list.page,
            pageSize: list.pageSize,
            total,
            totalPages: Math.ceil(total / list.pageSize),
            from: total === 0 ? 0 : (list.page - 1) * list.pageSize + 1,
            to: total === 0 ? 0 : Math.min(list.page * list.pageSize, total),
        },
    });
}));
router.post('/broadcast', rbac_1.requireStaff, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    if (!body.title?.trim() || !body.message?.trim()) {
        throw ApiError_1.ApiError.badRequest('A title and message are required');
    }
    await (0, notification_model_1.notifyStaff)({
        title: body.title.trim(),
        message: body.message.trim(),
        type: body.type ?? 'info',
    });
    return (0, ApiResponse_1.ok)(res, { sent: true }, 'Notification sent to staff');
}));
router.delete('/staff/:id', rbac_1.requireStaff, (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.execute)('DELETE FROM notifications WHERE id = ?', [Number(req.params.id)]);
    return (0, ApiResponse_1.ok)(res, { deleted: result.affectedRows });
}));
exports.default = router;
//# sourceMappingURL=notification.routes.js.map