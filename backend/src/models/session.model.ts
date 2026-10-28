import { execute, query, queryOne } from '../config/database';
import type { RowDataPacket } from 'mysql2';
import { buildPagedResult, buildSearchFilter, safeSort } from '../utils/pagination';
import type { ListQuery, Paginated } from '../types';
import { sha256 } from '../utils/jwt';

export interface SessionRow extends RowDataPacket {
  id: number;
  user_id: number;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  revoked_at: string | null;
  user_name?: string;
  user_email?: string;
  /** Present only for the caller's own sessions. */
  is_current?: number;
}

const SORTABLE = ['id', 'created_at', 'last_used_at', 'expires_at'] as const;

/**
 * Active sessions for one account.
 *
 * `is_current` is resolved in SQL by comparing the stored hash with the hash of
 * the refresh cookie the caller actually presented, so the account page can mark
 * the "this device" row without shipping hashes to the browser.
 */
export async function listSessions(
  userId: number,
  currentTokenHash: string | null,
  list: ListQuery
): Promise<Paginated<SessionRow>> {
  const where: string[] = ['s.user_id = ?', 's.revoked_at IS NULL', 's.expires_at > NOW()'];
  const params: Array<string | number> = [userId];

  const search = buildSearchFilter(list.search, ['s.ip_address', 's.user_agent']);
  if (search.clause) {
    where.push(search.clause);
    params.push(...search.params);
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const sortColumn = safeSort(list.sortBy, [...SORTABLE], 'last_used_at');
  const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';

  const countRow = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM sessions s ${whereSql}`,
    params
  );

  const rows = await query<SessionRow>(
    `SELECT s.id, s.user_id, s.ip_address, s.user_agent, s.created_at,
            s.last_used_at, s.expires_at, s.revoked_at,
            (s.refresh_token_hash = ?) AS is_current
       FROM sessions s
       ${whereSql}
      ORDER BY s.${sortColumn} ${direction}
      LIMIT ? OFFSET ?`,
    [currentTokenHash ?? '\0', ...params, list.pageSize, (list.page - 1) * list.pageSize]
  );

  return buildPagedResult(rows, Number(countRow?.total ?? 0), list.page, list.pageSize);
}

/** Every non-revoked session, store-wide. Admin "who is online" view. */
export async function listActiveSessions(list: ListQuery): Promise<Paginated<SessionRow>> {
  const where = ['s.revoked_at IS NULL', 's.expires_at > NOW()'];
  const params: Array<string | number> = [];

  const search = buildSearchFilter(list.search, ['u.full_name', 'u.email', 's.ip_address', 's.user_agent']);
  if (search.clause) {
    where.push(search.clause);
    params.push(...search.params);
  }
  if (list.filters.role) {
    where.push('u.role = ?');
    params.push(list.filters.role);
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const sortColumn = safeSort(list.sortBy, [...SORTABLE], 'last_used_at');
  const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';

  const countRow = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM sessions s JOIN users u ON u.id = s.user_id ${whereSql}`,
    params
  );

  const rows = await query<SessionRow>(
    `SELECT s.id, s.user_id, s.ip_address, s.user_agent, s.created_at,
            s.last_used_at, s.expires_at, s.revoked_at,
            u.full_name AS user_name, u.email AS user_email
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       ${whereSql}
      ORDER BY s.${sortColumn} ${direction}
      LIMIT ? OFFSET ?`,
    [...params, list.pageSize, (list.page - 1) * list.pageSize]
  );

  return buildPagedResult(rows, Number(countRow?.total ?? 0), list.page, list.pageSize);
}

/** Revoke a session, but only if it belongs to `userId` (or `null` for admins). */
export async function revokeSession(id: number, userId: number | null): Promise<boolean> {
  const result = userId === null
    ? await execute('UPDATE sessions SET revoked_at = NOW() WHERE id = ? AND revoked_at IS NULL', [id])
    : await execute(
        'UPDATE sessions SET revoked_at = NOW() WHERE id = ? AND user_id = ? AND revoked_at IS NULL',
        [id, userId]
      );
  return result.affectedRows > 0;
}

/** Sign a user out everywhere except the device that made the request. */
export async function revokeOtherSessions(userId: number, currentTokenHash: string): Promise<number> {
  const result = await execute(
    `UPDATE sessions SET revoked_at = NOW()
      WHERE user_id = ? AND revoked_at IS NULL AND refresh_token_hash <> ?`,
    [userId, currentTokenHash]
  );
  return result.affectedRows;
}

export function hashOf(token: string | undefined): string | null {
  return token ? sha256(token) : null;
}
