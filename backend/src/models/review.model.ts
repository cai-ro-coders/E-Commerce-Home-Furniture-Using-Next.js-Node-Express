import { execute, query, queryOne, type SqlParam } from '../config/database';
import { buildPagedResult, buildSearchFilter, safeSortExpression } from '../utils/pagination';
import type { ListQuery, Paginated, ReviewStatus } from '../types';
import type { RowDataPacket } from 'mysql2';

export interface ReviewRecord {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

type ReviewRow = RowDataPacket &
  ReviewRecord & {
    product_name?: string;
    product_slug?: string;
    product_image?: string | null;
    user_name?: string;
    user_email?: string;
    user_avatar?: string | null;
  };

/** Logical sort field -> SQL expression (aliases live on the joined tables). */
const SORTABLE: Record<string, string> = {
  id: 'r.id',
  rating: 'r.rating',
  status: 'r.status',
  created_at: 'r.created_at',
  product_name: 'p.name',
  user_name: 'u.full_name',
};

const REVIEW_SELECT = `
  SELECT r.*,
         p.name  AS product_name,
         p.slug  AS product_slug,
         (SELECT pi.image FROM product_images pi WHERE pi.product_id = p.id
           ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS product_image,
         u.full_name AS user_name,
         u.email     AS user_email,
         u.avatar    AS user_avatar
    FROM reviews r
    JOIN products p ON p.id = r.product_id
    JOIN users u    ON u.id = r.user_id`;

export interface ReviewFilters extends ListQuery {
  status?: ReviewStatus;
  product_id?: number;
  rating?: number;
}

export async function listReviews(filters: ReviewFilters): Promise<Paginated<ReviewRow>> {
  const where: string[] = [];
  const params: SqlParam[] = [];

  const search = buildSearchFilter(filters.search, ['r.title', 'r.comment', 'p.name', 'u.full_name']);
  if (search.clause) {
    where.push(search.clause);
    params.push(...search.params);
  }
  if (filters.status) {
    where.push('r.status = ?');
    params.push(filters.status);
  }
  if (filters.product_id) {
    where.push('r.product_id = ?');
    params.push(filters.product_id);
  }
  if (filters.rating) {
    where.push('r.rating = ?');
    params.push(filters.rating);
  }

  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  const sortColumn = safeSortExpression(filters.sortBy, SORTABLE, 'id');
  const direction = filters.sortDir === 'asc' ? 'ASC' : 'DESC';

  const countRow = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM reviews r
       JOIN products p ON p.id = r.product_id
       JOIN users u ON u.id = r.user_id ${whereSql}`,
    params
  );
  const total = Number(countRow?.total ?? 0);

  const rows = await query<ReviewRow>(
    `${REVIEW_SELECT}${whereSql} ORDER BY ${sortColumn} ${direction}, r.id DESC LIMIT ? OFFSET ?`,
    [...params, filters.pageSize, (filters.page - 1) * filters.pageSize]
  );

  return buildPagedResult(rows, total, filters.page, filters.pageSize);
}

/** Public storefront endpoint — only approved reviews, with the author's name. */
export async function listApprovedReviewsForProduct(
  productId: number,
  limit = 20,
  offset = 0
): Promise<ReviewRow[]> {
  return query<ReviewRow>(
    `SELECT r.id, r.rating, r.title, r.comment, r.created_at, u.full_name AS user_name, u.avatar AS user_avatar
       FROM reviews r
       JOIN users u ON u.id = r.user_id
      WHERE r.product_id = ? AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`,
    [productId, limit, offset]
  );
}

export async function countApprovedReviewsForProduct(productId: number): Promise<number> {
  const row = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM reviews WHERE product_id = ? AND status = 'approved'`,
    [productId]
  );
  return Number(row?.total ?? 0);
}

export async function findReviewById(id: number): Promise<ReviewRow | null> {
  return queryOne<ReviewRow>(`${REVIEW_SELECT} WHERE r.id = ? LIMIT 1`, [id]);
}

export async function userReviewedProduct(userId: number, productId: number): Promise<boolean> {
  const row = await queryOne<RowDataPacket>(
    'SELECT id FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1',
    [userId, productId]
  );
  return row !== null;
}

const REVIEW_FIELDS = ['rating', 'title', 'comment', 'status'];

export async function createReview(data: {
  product_id: number;
  user_id: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
  status?: ReviewStatus;
}): Promise<number> {
  const result = await execute(
    'INSERT INTO reviews (product_id, user_id, rating, title, comment, status) VALUES (?, ?, ?, ?, ?, ?)',
    [data.product_id, data.user_id, data.rating, data.title ?? null, data.comment ?? null, data.status ?? 'pending']
  );
  return result.insertId;
}

export async function updateReview(id: number, data: Partial<ReviewRecord>): Promise<boolean> {
  const entries = Object.entries(data).filter(
    ([key, value]) => REVIEW_FIELDS.includes(key) && value !== undefined
  );
  if (entries.length === 0) return false;
  const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
  const result = await execute(`UPDATE reviews SET ${setSql} WHERE id = ?`, [
    ...entries.map(([, value]) => value),
    id,
  ]);
  return result.affectedRows > 0;
}

export async function deleteReview(id: number): Promise<boolean> {
  const result = await execute('DELETE FROM reviews WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export interface ReviewStats extends RowDataPacket {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  average_rating: string;
}

export async function reviewStats(): Promise<ReviewStats> {
  return (
    (await queryOne<ReviewStats>(`
      SELECT COUNT(*)                                          AS total,
             COALESCE(SUM(status = 'pending'), 0)               AS pending,
             COALESCE(SUM(status = 'approved'), 0)              AS approved,
             COALESCE(SUM(status = 'rejected'), 0)              AS rejected,
             COALESCE(ROUND(AVG(rating), 2), 0)                 AS average_rating
        FROM reviews
    `)) ?? ({} as ReviewStats)
  );
}

/** Rating distribution (5★→1★) for the product detail page. */
export async function ratingBreakdown(productId: number): Promise<Array<{ rating: number; total: number }>> {
  const rows = await query<RowDataPacket & { rating: number; total: number }>(
    `SELECT rating, COUNT(*) AS total
       FROM reviews
      WHERE product_id = ? AND status = 'approved'
      GROUP BY rating
      ORDER BY rating DESC`,
    [productId]
  );
  const map = new Map(rows.map((row) => [Number(row.rating), Number(row.total)]));
  return [5, 4, 3, 2, 1].map((rating) => ({ rating, total: map.get(rating) ?? 0 }));
}
