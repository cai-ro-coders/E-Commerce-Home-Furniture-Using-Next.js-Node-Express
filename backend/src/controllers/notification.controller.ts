import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import {
  getNotifications,
  getUnreadCount,
  readAllNotifications,
  readNotification,
  removeNotification,
  sendNotification,
} from '../services/notification.service';

const userId = (req: Request) => req.user!.id;

export const listNotificationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const onlyUnread = req.query.unread === 'true' || req.query.unread === '1';
  return ok(res, await getNotifications(userId(req), limit, onlyUnread));
});

export const unreadCountHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getUnreadCount(userId(req)));
});

export const readNotificationHandler = asyncHandler(async (req: Request, res: Response) => {
  try {
    return ok(res, await readNotification(Number(req.params.id), userId(req)));
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      throw ApiError.notFound('Notification not found');
    }
    throw error;
  }
});

export const readAllNotificationsHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await readAllNotifications(userId(req)), 'All notifications marked as read');
});

export const deleteNotificationHandler = asyncHandler(async (req: Request, res: Response) => {
  try {
    await removeNotification(Number(req.params.id), userId(req));
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      throw ApiError.notFound('Notification not found');
    }
    throw error;
  }
  return noContent(res);
});

/** Staff broadcast. The same row is the in-app message; email/SMS are queued off this record. */
export const broadcastHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { title: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' };
  const result = await sendNotification({
    user_id: req.user!.id,
    title: body.title,
    message: body.message,
    type: body.type ?? 'info',
  });
  return created(res, result, 'Notification sent');
});
