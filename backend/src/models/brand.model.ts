import { execute, query, queryOne, type SqlParam } from '../config/database';
import { buildPagedResult, buildSearchFilter, safeSortExpression } from '../utils/pagination';
import type { ListQuery, Paginated } from '../types';
import type { RowDataPacket } from 'mysql2';

export interface BrandRecord {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

type BrandRow = RowDataPacket & BrandRecord & { product_count?: number };

/** Logical sort field -> SQL expression (`product_count` is a SELECT subquery alias). */
const SORTABLE: Record<string, string> = {
  id: 'b.id',
  name: 'b.name',
  slug: 'b.slug',
  status: 'b.status',
  created_at: 'b.created_at',
  product_count: 'product_count',
};

export async function listBrands(list: ListQuery): Promise<Paginated<BrandRow>> {
  const where: string[] = [];
  const params: SqlParam[] = [];

  const search = buildSearchFilter(list.search, ['b.name', 'b.slug', 'b.description']);
  if (search.clause) {
    where.push(search.clause);
    params.push(...search.params);
  }
  if (list.filters.status) {
    where.push('b.status = ?');
    params.push(list.filters.status);
  }

  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  const sortColumn = safeSortExpression(list.sortBy, SORTABLE, 'id');
  const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';

  const countRow = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM brands b ${whereSql}`,
    params
  );
  const total = Number(countRow?.total ?? 0);

  const rows = await query<BrandRow>(
    `SELECT b.*, (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id) AS product_count
       FROM brands b
       ${whereSql}
      ORDER BY ${sortColumn} ${direction}, b.id DESC
      LIMIT ? OFFSET ?`,
    [...params, list.pageSize, (list.page - 1) * list.pageSize]
  );

  return buildPagedResult(rows, total, list.page, list.pageSize);
}

/**
 * Storefront brand directory.
 *
 * Includes the description and a live count of *active* products so the
 * `/brands` page can render a useful card without an extra request per brand.
 */
export async function listAllBrands(): Promise<BrandRow[]> {
  return query<BrandRow>(
    `SELECT b.id, b.name, b.slug, b.logo, b.description, b.status,
            (SELECT COUNT(*) FROM products p
              WHERE p.brand_id = b.id AND p.status = 'active') AS product_count
       FROM brands b
      ORDER BY b.name ASC`
  );
}

export async function findBrandById(id: number): Promise<BrandRow | null> {
  return queryOne<BrandRow>(
    `SELECT b.*, (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id) AS product_count
       FROM brands b WHERE b.id = ? LIMIT 1`,
    [id]
  );
}

export async function findBrandBySlug(slug: string): Promise<BrandRow | null> {
  return queryOne<BrandRow>('SELECT * FROM brands WHERE slug = ? LIMIT 1', [slug]);
}

export async function countBrandProducts(id: number): Promise<number> {
  const row = await queryOne<RowDataPacket & { total: number }>(
    'SELECT COUNT(*) AS total FROM products WHERE brand_id = ?',
    [id]
  );
  return Number(row?.total ?? 0);
}

export async function createBrand(data: Partial<BrandRecord>): Promise<number> {
  const result = await execute(
    `INSERT INTO brands (name, slug, logo, description, status) VALUES (?, ?, ?, ?, ?)`,
    [data.name, data.slug, data.logo ?? null, data.description ?? null, data.status ?? 'active']
  );
  return result.insertId;
}

export async function updateBrand(id: number, data: Partial<BrandRecord>): Promise<boolean> {
  const fields = ['name', 'slug', 'logo', 'description', 'status'];
  const entries = Object.entries(data).filter(
    ([key, value]) => fields.includes(key) && value !== undefined
  );
  if (entries.length === 0) return false;
  const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
  const result = await execute(`UPDATE brands SET ${setSql} WHERE id = ?`, [
    ...entries.map(([, value]) => value),
    id,
  ]);
  return result.affectedRows > 0;
}

export async function deleteBrand(id: number): Promise<boolean> {
  const result = await execute('DELETE FROM brands WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
