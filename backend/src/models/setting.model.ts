import { execute, query, queryOne, type SqlParam } from '../config/database';
import { buildPagedResult, buildSearchFilter, safeSort } from '../utils/pagination';
import type { ListQuery, Paginated } from '../types';
import type { RowDataPacket } from 'mysql2';

export interface SettingRecord {
  id: number;
  key: string;
  group: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

type SettingRow = RowDataPacket & SettingRecord;

const SORTABLE = ['id', 'key', 'group', 'value', 'created_at', 'updated_at'] as const;

export async function listSettings(list: ListQuery): Promise<Paginated<SettingRow>> {
  const where: string[] = [];
  const params: SqlParam[] = [];

  const search = buildSearchFilter(list.search, ['`key`', '`group`', 'value']);
  if (search.clause) {
    where.push(search.clause);
    params.push(...search.params);
  }
  if (list.filters.group) {
    where.push('`group` = ?');
    params.push(list.filters.group);
  }

  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  const sortColumn = safeSort(list.sortBy, [...SORTABLE], 'id');
  const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';

  const countRow = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM settings ${whereSql}`,
    params
  );
  const total = Number(countRow?.total ?? 0);

  const rows = await query<SettingRow>(
    `SELECT * FROM settings ${whereSql} ORDER BY ${sortColumn} ${direction}, id DESC LIMIT ? OFFSET ?`,
    [...params, list.pageSize, (list.page - 1) * list.pageSize]
  );

  return buildPagedResult(rows, total, list.page, list.pageSize);
}

export async function findSettingById(id: number): Promise<SettingRow | null> {
  return queryOne<SettingRow>('SELECT * FROM settings WHERE id = ? LIMIT 1', [id]);
}

export async function findSettingByKey(key: string): Promise<SettingRow | null> {
  return queryOne<SettingRow>('SELECT * FROM settings WHERE `key` = ? LIMIT 1', [key]);
}

export async function keyExists(key: string, excludeId?: number): Promise<boolean> {
  const row = excludeId
    ? await queryOne<RowDataPacket>('SELECT id FROM settings WHERE `key` = ? AND id <> ? LIMIT 1', [
        key,
        excludeId,
      ])
    : await queryOne<RowDataPacket>('SELECT id FROM settings WHERE `key` = ? LIMIT 1', [key]);
  return row !== null;
}

export async function createSetting(data: {
  key: string;
  group: string;
  value: string;
}): Promise<number> {
  const result = await execute(
    'INSERT INTO settings (`key`, `group`, value) VALUES (?, ?, ?)',
    [data.key, data.group, data.value]
  );
  return result.insertId;
}

export async function updateSetting(
  id: number,
  data: Partial<Pick<SettingRecord, 'key' | 'group' | 'value'>>
): Promise<boolean> {
  const entries = Object.entries(data).filter(
    ([key, value]) => ['key', 'group', 'value'].includes(key) && value !== undefined
  );
  if (entries.length === 0) return false;
  const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
  const result = await execute(`UPDATE settings SET ${setSql} WHERE id = ?`, [
    ...entries.map(([, value]) => value),
    id,
  ]);
  return result.affectedRows > 0;
}

export async function deleteSetting(id: number): Promise<boolean> {
  const result = await execute('DELETE FROM settings WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/** All settings as a flat key→value map, used to configure the storefront. */
export async function settingsMap(): Promise<Record<string, string>> {
  const rows = await query<RowDataPacket & { key: string; value: string | null }>(
    'SELECT `key`, value FROM settings'
  );
  return Object.fromEntries(rows.map((row) => [row.key, row.value ?? '']));
}

/** Settings grouped by their `group` column — powers the grouped Settings UI. */
export async function settingsByGroup(): Promise<Record<string, SettingRecord[]>> {
  const rows = await query<RowDataPacket & SettingRecord>(
    'SELECT * FROM settings ORDER BY `group` ASC, `key` ASC'
  );
  const grouped: Record<string, SettingRecord[]> = {};
  for (const row of rows) {
    const group = (grouped[row.group] ??= []);
    group.push({
      id: row.id,
      key: row.key,
      group: row.group,
      value: row.value,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  }
  return grouped;
}

export async function listGroups(): Promise<Array<{ group: string; total: number }>> {
  return query<RowDataPacket & { group: string; total: number }>(
    'SELECT `group`, COUNT(*) AS total FROM settings GROUP BY `group` ORDER BY `group` ASC'
  );
}
