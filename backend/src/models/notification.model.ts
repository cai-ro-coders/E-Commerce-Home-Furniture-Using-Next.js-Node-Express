import { execute, query, queryOne } from '../config/database';
import type { RowDataPacket } from 'mysql2';

export interface NotificationRecord {
  id: number;
  user_id: number | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link: string | null;
  read_at: string | null;
  created_at: string;
}

type NotificationRow = RowDataPacket & NotificationRecord;

/**
 * Notifications addressed to a user, plus broadcast notifications (user_id IS
 * NULL) that staff and admins all see.
 */
export async function listNotifications(
  userId: number,
  limit = 20,
  onlyUnread = false
): Promise<NotificationRow[]> {
  const readFilter = onlyUnread ? 'AND n.read_at IS NULL' : '';
  return query<NotificationRow>(
    `SELECT n.* FROM notifications n
      WHERE (n.user_id = ? OR n.user_id IS NULL) ${readFilter}
      ORDER BY n.read_at IS NOT NULL ASC, n.created_at DESC
      LIMIT ?`,
    [userId, limit]
  );
}

export async function unreadCount(userId: number): Promise<number> {
  const row = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM notifications
      WHERE (user_id = ? OR user_id IS NULL) AND read_at IS NULL`,
    [userId]
  );
  return Number(row?.total ?? 0);
}

export async function markRead(id: number, userId: number): Promise<boolean> {
  const result = await execute(
    'UPDATE notifications SET read_at = NOW() WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
    [id, userId]
  );
  return result.affectedRows > 0;
}

export async function markAllRead(userId: number): Promise<number> {
  const result = await execute(
    'UPDATE notifications SET read_at = NOW() WHERE (user_id = ? OR user_id IS NULL) AND read_at IS NULL',
    [userId]
  );
  return result.affectedRows;
}

export async function deleteNotification(id: number, userId: number): Promise<boolean> {
  const result = await execute(
    'DELETE FROM notifications WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
    [id, userId]
  );
  return result.affectedRows > 0;
}

export async function createNotification(data: {
  user_id?: number | null;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string | null;
}): Promise<number> {
  const result = await execute(
    'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
    [data.user_id ?? null, data.title, data.message, data.type ?? 'info', data.link ?? null]
  );
  return result.insertId;
}

/**
 * Notify every back-office user. Called when a customer places an order, leaves
 * a review, stock runs low, etc.
 */
export async function notifyStaff(data: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string | null;
}): Promise<void> {
  const result = await execute(
    `INSERT INTO notifications (user_id, title, message, type, link)
     SELECT u.id, ?, ?, ?, ? FROM users u WHERE u.role IN ('admin', 'staff') AND u.status = 'active'`,
    [data.title, data.message, data.type ?? 'info', data.link ?? null]
  );
  if (result.affectedRows === 0) return;
}
