import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { validate, asyncHandler } from '../utils/asyncHandler';
import { ok, paginated } from '../utils/ApiResponse';
import { parseListQuery } from '../utils/pagination';
import { idParamSchema } from '../validators/common.validator';
import {
  deleteNotificationHandler,
  listNotificationsHandler,
  readAllNotificationsHandler,
  readNotificationHandler,
  unreadCountHandler,
} from '../controllers/notification.controller';
import { requireStaff } from '../middleware/rbac';
import { query, execute } from '../config/database';
import { notifyStaff } from '../models/notification.model';
import { ApiError } from '../utils/ApiError';
import type { RowDataPacket } from 'mysql2';

const router = Router();

router.use(authenticate);

// The signed-in user's own bell menu.
router.get('/', listNotificationsHandler);
router.get('/unread-count', unreadCountHandler);
router.patch('/read-all', readAllNotificationsHandler);
router.patch('/:id/read', validate(idParamSchema, 'params'), readNotificationHandler);
router.delete('/:id', validate(idParamSchema, 'params'), deleteNotificationHandler);

/** Staff inbox: every notification addressed to a staff or admin account. */
router.get(
  '/staff/all',
  requireStaff,
  asyncHandler(async (req: Request, res: Response) => {
    const list = parseListQuery(req);
    const where: string[] = ['n.user_id IN (SELECT id FROM users WHERE role IN (\'admin\', \'staff\'))'];
    const params: Array<string | number> = [];

    if (list.search) {
      where.push('(n.title LIKE ? OR n.message LIKE ?)');
      const like = `%${list.search.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
      params.push(like, like);
    }
    const whereSql = `WHERE ${where.join(' AND ')}`;

    const [count] = await query<RowDataPacket & { total: number }>(
      `SELECT COUNT(*) AS total FROM notifications n ${whereSql}`,
      params
    );
    const total = Number(count?.total ?? 0);
    const rows = await query(
      `SELECT n.*, u.full_name AS recipient
         FROM notifications n
         LEFT JOIN users u ON u.id = n.user_id
         ${whereSql}
        ORDER BY n.id DESC
        LIMIT ? OFFSET ?`,
      [...params, list.pageSize, (list.page - 1) * list.pageSize]
    );

    return paginated(res, {
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
  })
);

router.post(
  '/broadcast',
  requireStaff,
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as { title?: string; message?: string; type?: 'info' | 'success' | 'warning' | 'error' };
    if (!body.title?.trim() || !body.message?.trim()) {
      throw ApiError.badRequest('A title and message are required');
    }
    await notifyStaff({
      title: body.title.trim(),
      message: body.message.trim(),
      type: body.type ?? 'info',
    });
    return ok(res, { sent: true }, 'Notification sent to staff');
  })
);

router.delete(
  '/staff/:id',
  requireStaff,
  validate(idParamSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await execute('DELETE FROM notifications WHERE id = ?', [Number(req.params.id)]);
    return ok(res, { deleted: result.affectedRows });
  })
);

export default router;
