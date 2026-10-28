import { execute, query, queryOne, type SqlParam } from '../config/database';
import { buildPagedResult, buildSearchFilter, safeSortExpression } from '../utils/pagination';
import type { ListQuery, Paginated } from '../types';
import type { RowDataPacket } from 'mysql2';

export interface CategoryRecord {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export type CategoryRow = RowDataPacket & CategoryRecord & {
  product_count?: number;
  parent_name?: string;
};

/** The public `/categories/tree` shape: rows nested by `parent_id`. */
export type CategoryTreeNode = CategoryRow & { children: CategoryTreeNode[] };

/** Logical sort field -> SQL expression (`product_count` is a SELECT subquery alias). */
const SORTABLE: Record<string, string> = {
  id: 'c.id',
  name: 'c.name',
  slug: 'c.slug',
  status: 'c.status',
  created_at: 'c.created_at',
  product_count: 'product_count',
};

export async function listCategories(list: ListQuery): Promise<Paginated<CategoryRow>> {
  const where: string[] = [];
  const params: SqlParam[] = [];

  const search = buildSearchFilter(list.search, ['c.name', 'c.slug', 'c.description']);
  if (search.clause) {
    where.push(search.clause);
    params.push(...search.params);
  }
  if (list.filters.status) {
    where.push('c.status = ?');
    params.push(list.filters.status);
  }
  if (list.filters.parent_id) {
    where.push('c.parent_id = ?');
    params.push(list.filters.parent_id);
  }

  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  const sortColumn = safeSortExpression(list.sortBy, SORTABLE, 'id');
  const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';

  const countRow = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM categories c ${whereSql}`,
    params
  );
  const total = Number(countRow?.total ?? 0);

  const rows = await query<CategoryRow>(
    `SELECT c.*, p.name AS parent_name,
            (SELECT COUNT(*) FROM products pr WHERE pr.category_id = c.id) AS product_count
       FROM categories c
       LEFT JOIN categories p ON p.id = c.parent_id
       ${whereSql}
      ORDER BY ${sortColumn} ${direction}, c.id DESC
      LIMIT ? OFFSET ?`,
    [...params, list.pageSize, (list.page - 1) * list.pageSize]
  );

  return buildPagedResult(rows, total, list.page, list.pageSize);
}

/** Full tree, used to populate the parent <select> without N+1 queries. */
export async function categoryTree(): Promise<CategoryRow[]> {
  return query<CategoryRow>(
    `SELECT c.id, c.parent_id, c.name, c.slug, c.status,
            (SELECT COUNT(*) FROM products pr WHERE pr.category_id = c.id) AS product_count
       FROM categories c
      ORDER BY c.name ASC`
  );
}

export async function findCategoryById(id: number): Promise<CategoryRow | null> {
  return queryOne<CategoryRow>(
    `SELECT c.*, p.name AS parent_name,
            (SELECT COUNT(*) FROM products pr WHERE pr.category_id = c.id) AS product_count
       FROM categories c
       LEFT JOIN categories p ON p.id = c.parent_id
      WHERE c.id = ? LIMIT 1`,
    [id]
  );
}

export async function findCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  return queryOne<CategoryRow>('SELECT * FROM categories WHERE slug = ? LIMIT 1', [slug]);
}

export async function slugExists(table: 'categories' | 'brands', slug: string, excludeId?: number): Promise<boolean> {
  const row = excludeId
    ? await queryOne<RowDataPacket>(`SELECT id FROM \`${table}\` WHERE slug = ? AND id <> ? LIMIT 1`, [slug, excludeId])
    : await queryOne<RowDataPacket>(`SELECT id FROM \`${table}\` WHERE slug = ? LIMIT 1`, [slug]);
  return row !== null;
}

/** Direct children of a category — used to block deletes that would orphan rows. */
export async function countChildren(id: number): Promise<number> {
  const row = await queryOne<RowDataPacket & { total: number }>(
    'SELECT COUNT(*) AS total FROM categories WHERE parent_id = ?',
    [id]
  );
  return Number(row?.total ?? 0);
}

export async function countProducts(id: number): Promise<number> {
  const row = await queryOne<RowDataPacket & { total: number }>(
    'SELECT COUNT(*) AS total FROM products WHERE category_id = ?',
    [id]
  );
  return Number(row?.total ?? 0);
}

export async function createCategory(data: Partial<CategoryRecord>): Promise<number> {
  const result = await execute(
    `INSERT INTO categories (parent_id, name, slug, image, description, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.parent_id ?? null,
      data.name,
      data.slug,
      data.image ?? null,
      data.description ?? null,
      data.status ?? 'active',
    ]
  );
  return result.insertId;
}

export async function updateCategory(id: number, data: Partial<CategoryRecord>): Promise<boolean> {
  const fields = ['parent_id', 'name', 'slug', 'image', 'description', 'status'];
  const entries = Object.entries(data).filter(
    ([key, value]) => fields.includes(key) && value !== undefined
  );
  if (entries.length === 0) return false;
  const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
  const result = await execute(`UPDATE categories SET ${setSql} WHERE id = ?`, [
    ...entries.map(([, value]) => value),
    id,
  ]);
  return result.affectedRows > 0;
}

export async function deleteCategory(id: number): Promise<boolean> {
  const result = await execute('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
