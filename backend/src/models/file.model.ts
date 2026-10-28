import { execute, query, queryOne, type SqlParam } from '../config/database';
import { buildPagedResult, buildSearchFilter, safeSort } from '../utils/pagination';
import type { FileCategory, ListQuery, Paginated } from '../types';
import type { RowDataPacket } from 'mysql2';

export interface FileRecord {
  id: number;
  name: string;
  original_name: string;
  path: string;
  mime_type: string;
  size: number;
  category: FileCategory;
  uploaded_by: number | null;
  created_at: string;
  updated_at: string;
}

type FileRow = RowDataPacket & FileRecord & { uploader_name?: string | null };

const SORTABLE = ['id', 'name', 'original_name', 'category', 'size', 'created_at'] as const;

export async function listFiles(list: ListQuery): Promise<Paginated<FileRow>> {
  const where: string[] = [];
  const params: SqlParam[] = [];

  const search = buildSearchFilter(list.search, ['f.name', 'f.original_name', 'f.mime_type']);
  if (search.clause) {
    where.push(search.clause);
    params.push(...search.params);
  }
  if (list.filters.category) {
    where.push('f.category = ?');
    params.push(list.filters.category);
  }

  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  const sortColumn = safeSort(list.sortBy, [...SORTABLE], 'id');
  const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';

  const countRow = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM files f ${whereSql}`,
    params
  );
  const total = Number(countRow?.total ?? 0);

  const rows = await query<FileRow>(
    `SELECT f.*, u.full_name AS uploader_name
       FROM files f
       LEFT JOIN users u ON u.id = f.uploaded_by
       ${whereSql}
      ORDER BY f.${sortColumn} ${direction}, f.id DESC
      LIMIT ? OFFSET ?`,
    [...params, list.pageSize, (list.page - 1) * list.pageSize]
  );

  return buildPagedResult(rows, total, list.page, list.pageSize);
}

export async function findFileById(id: number): Promise<FileRow | null> {
  return queryOne<FileRow>(
    `SELECT f.*, u.full_name AS uploader_name FROM files f
      LEFT JOIN users u ON u.id = f.uploaded_by
     WHERE f.id = ? LIMIT 1`,
    [id]
  );
}

export async function createFile(data: {
  name: string;
  original_name: string;
  path: string;
  mime_type: string;
  size: number;
  category: FileCategory;
  uploaded_by: number | null;
}): Promise<number> {
  const result = await execute(
    `INSERT INTO files (name, original_name, path, mime_type, size, category, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.original_name,
      data.path,
      data.mime_type,
      data.size,
      data.category,
      data.uploaded_by,
    ]
  );
  return result.insertId;
}

export async function updateFileCategory(id: number, category: FileCategory): Promise<boolean> {
  const result = await execute('UPDATE files SET category = ? WHERE id = ?', [category, id]);
  return result.affectedRows > 0;
}

export async function deleteFile(id: number): Promise<{ path: string } | null> {
  const row = await queryOne<RowDataPacket & { path: string }>(
    'SELECT path FROM files WHERE id = ? LIMIT 1',
    [id]
  );
  if (!row) return null;
  await execute('DELETE FROM files WHERE id = ?', [id]);
  return { path: row.path };
}

export interface FileStats extends RowDataPacket {
  total_files: number;
  total_size: string;
  images: number;
  documents: number;
  contracts: number;
  invoices: number;
  customer_files: number;
}

export async function fileStats(): Promise<FileStats> {
  return (
    (await queryOne<FileStats>(`
      SELECT COUNT(*)                                    AS total_files,
             COALESCE(SUM(size), 0)                      AS total_size,
             COALESCE(SUM(category = 'image'), 0)        AS images,
             COALESCE(SUM(category = 'document'), 0)     AS documents,
             COALESCE(SUM(category = 'contract'), 0)     AS contracts,
             COALESCE(SUM(category = 'invoice'), 0)      AS invoices,
             COALESCE(SUM(category = 'customer'), 0)     AS customer_files
        FROM files
    `)) ?? ({} as FileStats)
  );
}
