import { execute, query, queryOne, transaction, type SqlParam } from '../config/database';
import { buildPagedResult, buildSearchFilter, safeSortExpression } from '../utils/pagination';
import type { ListQuery, Paginated, ProductStatus } from '../types';
import type { RowDataPacket } from 'mysql2';

export interface ProductRecord {
  id: number;
  category_id: number;
  brand_id: number | null;
  sku: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: string;
  sale_price: string | null;
  cost_price: string | null;
  weight: string | null;
  dimensions: string | null;
  stock_quantity: number;
  minimum_stock: number;
  featured: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

type ProductRow = RowDataPacket &
  ProductRecord & {
    category_name?: string;
    brand_name?: string;
    primary_image?: string | null;
    image_count?: number;
    review_count?: number;
    avg_rating?: number;
  };

export interface ProductImageRecord {
  id: number;
  product_id: number;
  image: string;
  is_primary: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductSpecificationRecord {
  id: number;
  product_id: number;
  attribute_name: string;
  attribute_value: string;
}

/** Logical sort field -> SQL expression (aliases live on the joined tables). */
const SORTABLE: Record<string, string> = {
  id: 'p.id',
  name: 'p.name',
  sku: 'p.sku',
  price: 'p.price',
  sale_price: 'p.sale_price',
  effective_price: 'COALESCE(p.sale_price, p.price)',
  stock_quantity: 'p.stock_quantity',
  status: 'p.status',
  featured: 'p.featured',
  created_at: 'p.created_at',
  category_name: 'c.name',
  brand_name: 'b.name',
  avg_rating: 'avg_rating',
  review_count: 'review_count',
};

/**
 * Single source of truth for the product SELECT. Every list and detail query
 * shares this projection so the admin table, the storefront grid, and the
 * DataTables export all agree on column names and the primary image rule.
 */
const PRODUCT_SELECT = `
  SELECT p.*,
         c.name  AS category_name,
         b.name  AS brand_name,
         (SELECT pi.image FROM product_images pi
           WHERE pi.product_id = p.id
           ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) AS primary_image,
         (SELECT COUNT(*) FROM product_images pi WHERE pi.product_id = p.id)             AS image_count,
         (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.status = 'approved') AS review_count,
         (SELECT ROUND(AVG(r.rating), 2) FROM reviews r
           WHERE r.product_id = p.id AND r.status = 'approved')                          AS avg_rating
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id`;

export interface ProductFilters extends ListQuery {
  category_id?: number;
  category_ids?: number[];
  brand_id?: number;
  brand_ids?: number[];
  categoryIds?: number[];
  brandIds?: number[];
  status?: string;
  featured?: boolean;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  low_stock?: boolean;
  out_of_stock?: boolean;
  on_sale?: boolean;
  in_stock?: boolean;
  /** Camel-case aliases used by the service layer. */
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  lowStock?: boolean;
  outOfStock?: boolean;
  onSale?: boolean;
  inStock?: boolean;
}

function buildWhere(filters: ProductFilters): { sql: string; params: SqlParam[] } {
  const where: string[] = [];
  const params: SqlParam[] = [];

  const search = buildSearchFilter(filters.search, ['p.name', 'p.sku', 'p.short_description']);
  if (search.clause) {
    where.push(search.clause);
    params.push(...search.params);
  }

  // The admin service and the storefront controller use different spellings for
  // the same filters. Accept both here so neither path silently drops a filter.
  const categoryIds = (filters.category_ids ?? filters.categoryIds)?.filter(Boolean);
  if (categoryIds?.length) {
    where.push(`p.category_id IN (${categoryIds.map(() => '?').join(', ')})`);
    params.push(...categoryIds);
  } else {
    const categoryId = filters.category_id ?? filters.categoryId;
    if (categoryId) {
      where.push('p.category_id = ?');
      params.push(categoryId);
    }
  }

  const brandIds = (filters.brand_ids ?? filters.brandIds)?.filter(Boolean);
  if (brandIds?.length) {
    where.push(`p.brand_id IN (${brandIds.map(() => '?').join(', ')})`);
    params.push(...brandIds);
  } else {
    const brandId = filters.brand_id ?? filters.brandId;
    if (brandId) {
      where.push('p.brand_id = ?');
      params.push(brandId);
    }
  }

  if (filters.status) {
    where.push('p.status = ?');
    params.push(filters.status);
  }
  if (filters.featured !== undefined) {
    where.push('p.featured = ?');
    params.push(filters.featured ? 1 : 0);
  }

  const minPrice = filters.min_price ?? filters.minPrice;
  if (minPrice !== undefined) {
    where.push('COALESCE(p.sale_price, p.price) >= ?');
    params.push(minPrice);
  }
  const maxPrice = filters.max_price ?? filters.maxPrice;
  if (maxPrice !== undefined) {
    where.push('COALESCE(p.sale_price, p.price) <= ?');
    params.push(maxPrice);
  }

  const minRating = filters.min_rating ?? filters.minRating;
  if (minRating !== undefined) {
    where.push(
      `(SELECT AVG(r.rating) FROM reviews r
         WHERE r.product_id = p.id AND r.status = 'approved') >= ?`
    );
    params.push(minRating);
  }

  if (filters.out_of_stock ?? filters.outOfStock) {
    where.push('p.stock_quantity = 0');
  }
  if (filters.low_stock ?? filters.lowStock) {
    where.push('p.stock_quantity > 0 AND p.stock_quantity <= p.minimum_stock');
  }
  if (filters.on_sale ?? filters.onSale) {
    where.push('p.sale_price IS NOT NULL');
  }
  if (filters.in_stock ?? filters.inStock) {
    where.push('p.stock_quantity > 0');
  }

  return { sql: where.length ? ` WHERE ${where.join(' AND ')}` : '', params };
}

export async function listProducts(filters: ProductFilters): Promise<Paginated<ProductRow>> {
  const { sql: whereSql, params } = buildWhere(filters);
  const sortColumn = safeSortExpression(filters.sortBy, SORTABLE, 'id');
  const direction = filters.sortDir === 'asc' ? 'ASC' : 'DESC';

  const countRow = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM products p JOIN categories c ON c.id = p.category_id
     LEFT JOIN brands b ON b.id = p.brand_id${whereSql}`,
    params
  );
  const total = Number(countRow?.total ?? 0);

  const rows = await query<ProductRow>(
    `${PRODUCT_SELECT}${whereSql} ORDER BY ${sortColumn} ${direction}, p.id DESC LIMIT ? OFFSET ?`,
    [...params, filters.pageSize, (filters.page - 1) * filters.pageSize]
  );

  return buildPagedResult(rows, total, filters.page, filters.pageSize);
}

/**
 * Price bounds for the storefront's price slider.
 *
 * Uses the same WHERE builder as the listing, so the slider can never offer a
 * range outside the current collection.
 */
export async function productPriceRange(filters: ProductFilters) {
  const { sql: whereSql, params } = buildWhere(filters);
  const row = await queryOne<
    RowDataPacket & { min_price: number | string | null; max_price: number | string | null; total: number }
  >(
    `SELECT MIN(COALESCE(p.sale_price, p.price)) AS min_price,
            MAX(COALESCE(p.sale_price, p.price)) AS max_price,
            COUNT(*) AS total
       FROM products p
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       ${whereSql}`,
    params
  );

  return {
    min_price: Number(row?.min_price ?? 0),
    max_price: Number(row?.max_price ?? 0),
    total: Number(row?.total ?? 0),
  };
}

export async function findProductById(id: number): Promise<ProductRow | null> {
  return queryOne<ProductRow>(`${PRODUCT_SELECT} WHERE p.id = ? LIMIT 1`, [id]);
}

export async function findProductBySlug(slug: string): Promise<ProductRow | null> {
  return queryOne<ProductRow>(`${PRODUCT_SELECT} WHERE p.slug = ? LIMIT 1`, [slug]);
}

export async function skuExists(sku: string, excludeId?: number): Promise<boolean> {
  const row = excludeId
    ? await queryOne<RowDataPacket>('SELECT id FROM products WHERE sku = ? AND id <> ? LIMIT 1', [
        sku,
        excludeId,
      ])
    : await queryOne<RowDataPacket>('SELECT id FROM products WHERE sku = ? LIMIT 1', [sku]);
  return row !== null;
}

export async function slugExists(slug: string, excludeId?: number): Promise<boolean> {
  const row = excludeId
    ? await queryOne<RowDataPacket>('SELECT id FROM products WHERE slug = ? AND id <> ? LIMIT 1', [
        slug,
        excludeId,
      ])
    : await queryOne<RowDataPacket>('SELECT id FROM products WHERE slug = ? LIMIT 1', [slug]);
  return row !== null;
}

const PRODUCT_FIELDS = [
  'category_id',
  'brand_id',
  'sku',
  'name',
  'slug',
  'short_description',
  'description',
  'price',
  'sale_price',
  'cost_price',
  'weight',
  'dimensions',
  'stock_quantity',
  'minimum_stock',
  'featured',
  'status',
];

/**
 * Product money/quantity fields are accepted as numbers here. The validator
 * turns form strings into numbers, and MySQL coerces them to DECIMAL/INT, so
 * forcing a string round-trip would only add friction.
 */
export interface NewProduct {
  category_id: number;
  brand_id: number | null;
  sku: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  cost_price: number | null;
  weight: number | null;
  dimensions: string | null;
  stock_quantity: number;
  minimum_stock: number;
  featured: number;
  status: ProductStatus;
}

/** Money/quantity fields may be patched as numbers; everything else matches the row type. */
export type ProductPatch = Partial<Omit<ProductRecord, 'price' | 'sale_price' | 'cost_price' | 'weight'>> & {
  price?: number;
  sale_price?: number | null;
  cost_price?: number | null;
  weight?: number | null;
};

export async function createProduct(data: NewProduct): Promise<number> {
  const result = await execute(
    `INSERT INTO products
       (category_id, brand_id, sku, name, slug, short_description, description, price,
        sale_price, cost_price, weight, dimensions, stock_quantity, minimum_stock, featured, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.category_id,
      data.brand_id ?? null,
      data.sku,
      data.name,
      data.slug,
      data.short_description ?? null,
      data.description ?? null,
      data.price,
      data.sale_price ?? null,
      data.cost_price ?? null,
      data.weight ?? null,
      data.dimensions ?? null,
      data.stock_quantity ?? 0,
      data.minimum_stock ?? 5,
      data.featured ? 1 : 0,
      data.status ?? 'active',
    ]
  );
  return result.insertId;
}

export async function updateProduct(id: number, data: ProductPatch): Promise<boolean> {
  const entries = Object.entries(data).filter(
    ([key, value]) => PRODUCT_FIELDS.includes(key) && value !== undefined
  ) as Array<[string, SqlParam]>;
  if (entries.length === 0) return false;
  const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
  const params = entries.map(([key, value]) => {
    // MySQL TINYINT(1) expects 0/1 rather than true/false.
    if (key === 'featured') return value ? 1 : 0;
    return value;
  });
  const result = await execute(`UPDATE products SET ${setSql} WHERE id = ?`, [...params, id]);
  return result.affectedRows > 0;
}

/** Delete a product and its images/specs/reviews, logging the stock movement. */
export async function deleteProduct(id: number, userId: number | null): Promise<boolean> {
  return transaction(async (connection) => {
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE',
      [id]
    );
    if (rows.length === 0) return false;

    const stock = Number(rows[0].stock_quantity);
    if (stock > 0) {
      await connection.execute(
        `INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks, created_by)
         VALUES (?, 'adjustment', ?, 'DELETE', 'Product deleted from catalogue', ?)`,
        [id, -stock, userId]
      );
    }
    // product_images / product_specifications / reviews / cart_items / wishlists
    // cascade automatically via their foreign keys.
    const [result] = await connection.execute('DELETE FROM products WHERE id = ?', [id]);
    return (result as { affectedRows: number }).affectedRows > 0;
  });
}

// ------------------------------------------------------------------- images
export async function listProductImages(productId: number): Promise<ProductImageRecord[]> {
  return query<RowDataPacket & ProductImageRecord>(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC, id ASC',
    [productId]
  );
}

export async function addProductImage(data: {
  product_id: number;
  image: string;
  is_primary?: boolean;
  sort_order?: number;
}): Promise<number> {
  return transaction(async (connection) => {
    if (data.is_primary) {
      await connection.execute('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [
        data.product_id,
      ]);
    }
    const [result] = await connection.execute(
      `INSERT INTO product_images (product_id, image, is_primary, sort_order) VALUES (?, ?, ?, ?)`,
      [data.product_id, data.image, data.is_primary ? 1 : 0, data.sort_order ?? 0]
    );
    return (result as { insertId: number }).insertId;
  });
}

export async function deleteProductImage(id: number): Promise<{ image: string } | null> {
  const row = await queryOne<RowDataPacket & { image: string }>(
    'SELECT image FROM product_images WHERE id = ? LIMIT 1',
    [id]
  );
  if (!row) return null;
  await execute('DELETE FROM product_images WHERE id = ?', [id]);
  return { image: row.image };
}

export async function setPrimaryImage(productId: number, imageId: number): Promise<boolean> {
  return transaction(async (connection) => {
    await connection.execute('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [
      productId,
    ]);
    const [result] = await connection.execute(
      'UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?',
      [imageId, productId]
    );
    return (result as { affectedRows: number }).affectedRows > 0;
  });
}

// ----------------------------------------------------------- specifications
export async function listSpecifications(productId: number): Promise<ProductSpecificationRecord[]> {
  return query<RowDataPacket & ProductSpecificationRecord>(
    'SELECT * FROM product_specifications WHERE product_id = ? ORDER BY id ASC',
    [productId]
  );
}

export async function replaceSpecifications(
  productId: number,
  specifications: Array<{ attribute_name: string; attribute_value: string }>
): Promise<void> {
  await transaction(async (connection) => {
    await connection.execute('DELETE FROM product_specifications WHERE product_id = ?', [productId]);
    for (const spec of specifications) {
      await connection.execute(
        'INSERT INTO product_specifications (product_id, attribute_name, attribute_value) VALUES (?, ?, ?)',
        [productId, spec.attribute_name, spec.attribute_value]
      );
    }
  });
}

// --------------------------------------------------------------- inventory
export interface InventoryLogRow extends RowDataPacket {
  id: number;
  product_id: number;
  type: string;
  quantity: number;
  reference: string | null;
  remarks: string | null;
  created_at: string;
  product_name?: string;
  sku?: string;
  user_name?: string | null;
}

export async function logInventoryMovement(
  data: {
    productId: number;
    type: 'stock_in' | 'stock_out' | 'adjustment' | 'return';
    quantity: number;
    reference?: string | null;
    remarks?: string | null;
    userId?: number | null;
  },
  connection?: import('mysql2/promise').PoolConnection
): Promise<void> {
  const sql = `INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks, created_by)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [
    data.productId,
    data.type,
    data.quantity,
    data.reference ?? null,
    data.remarks ?? null,
    data.userId ?? null,
  ];
  if (connection) {
    await connection.execute(sql, params);
  } else {
    await execute(sql, params);
  }
}

/** Apply a signed stock delta and record the movement, atomically. */
export async function adjustStock(
  data: {
    productId: number;
    type: 'stock_in' | 'stock_out' | 'adjustment' | 'return';
    quantity: number;
    reference?: string | null;
    remarks?: string | null;
    userId?: number | null;
  }
): Promise<{ stock_quantity: number }> {
  return transaction(async (connection) => {
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT stock_quantity, name, sku FROM products WHERE id = ? FOR UPDATE',
      [data.productId]
    );
    if (rows.length === 0) throw new Error('PRODUCT_NOT_FOUND');

    const current = Number(rows[0].stock_quantity);

    // `quantity` is entered as a positive number; the log column is signed.
    // stock_out always decrements, the others increment.
    const delta = data.type === 'stock_out' ? -Math.abs(data.quantity) : Math.abs(data.quantity);
    const next = current + delta;

    if (next < 0) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    await connection.execute('UPDATE products SET stock_quantity = ? WHERE id = ?', [
      next,
      data.productId,
    ]);

    await connection.execute(
      `INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.productId, data.type, delta, data.reference ?? null, data.remarks ?? null, data.userId ?? null]
    );

    return { stock_quantity: next };
  });
}
export async function listInventoryLogs(
  list: ListQuery
): Promise<Paginated<InventoryLogRow>> {
  const where: string[] = [];
  const params: SqlParam[] = [];

  if (list.filters.product_id) {
    where.push('il.product_id = ?');
    params.push(list.filters.product_id);
  }
  if (list.filters.type) {
    where.push('il.type = ?');
    params.push(list.filters.type);
  }

  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  const countRow = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM inventory_logs il ${whereSql}`,
    params
  );
  const total = Number(countRow?.total ?? 0);

  const rows = await query<InventoryLogRow>(
    `SELECT il.*, p.name AS product_name, p.sku, u.full_name AS user_name
       FROM inventory_logs il
       JOIN products p ON p.id = il.product_id
       LEFT JOIN users u ON u.id = il.created_by
       ${whereSql}
      ORDER BY il.created_at DESC, il.id DESC
      LIMIT ? OFFSET ?`,
    [...params, list.pageSize, (list.page - 1) * list.pageSize]
  );

  return buildPagedResult(rows, total, list.page, list.pageSize);
}

// ------------------------------------------------------------- product stats
export interface ProductStats extends RowDataPacket {
  total_products: number;
  active_listings: number;
  draft_products: number;
  archived_products: number;
  out_of_stock: number;
  low_stock: number;
  inventory_units: number;
  inventory_value: string;
  featured_products: number;
}

export async function productStats(): Promise<ProductStats> {
  return (
    (await queryOne<ProductStats>(`
      SELECT
        COUNT(*)                                                              AS total_products,
        COALESCE(SUM(status = 'active'), 0)                                 AS active_listings,
        COALESCE(SUM(status = 'draft'), 0)                                  AS draft_products,
        COALESCE(SUM(status = 'archived'), 0)                                AS archived_products,
        COALESCE(SUM(stock_quantity = 0), 0)                                 AS out_of_stock,
        COALESCE(SUM(stock_quantity > 0 AND stock_quantity <= minimum_stock), 0) AS low_stock,
        COALESCE(SUM(stock_quantity), 0)                                     AS inventory_units,
        COALESCE(SUM(stock_quantity * COALESCE(cost_price, price)), 0)       AS inventory_value,
        COALESCE(SUM(featured = 1), 0)                                       AS featured_products
      FROM products
    `)) ?? ({} as ProductStats)
  );
}
