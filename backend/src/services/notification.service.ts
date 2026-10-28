import {
  createNotification,
  deleteNotification,
  listNotifications,
  markAllRead,
  markRead,
  unreadCount,
} from '../models/notification.model';

export async function getNotifications(userId: number, limit: number, onlyUnread: boolean) {
  const [items, unread] = await Promise.all([
    listNotifications(userId, limit, onlyUnread),
    unreadCount(userId),
  ]);
  return { items, unread_count: unread };
}

export async function getUnreadCount(userId: number) {
  return { unread_count: await unreadCount(userId) };
}

export async function readNotification(id: number, userId: number) {
  const done = await markRead(id, userId);
  if (!done) throw new Error('NOT_FOUND');
  return { read: true };
}

export async function readAllNotifications(userId: number) {
  const count = await markAllRead(userId);
  return { marked_read: count };
}

export async function removeNotification(id: number, userId: number) {
  const done = await deleteNotification(id, userId);
  if (!done) throw new Error('NOT_FOUND');
  return { deleted: true };
}

export async function sendNotification(data: {
  user_id?: number | null;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string | null;
}) {
  const id = await createNotification(data);
  return { id };
}
