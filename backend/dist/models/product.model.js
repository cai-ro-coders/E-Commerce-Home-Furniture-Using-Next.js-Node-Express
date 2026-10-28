"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.productPriceRange = productPriceRange;
exports.findProductById = findProductById;
exports.findProductBySlug = findProductBySlug;
exports.skuExists = skuExists;
exports.slugExists = slugExists;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.listProductImages = listProductImages;
exports.addProductImage = addProductImage;
exports.deleteProductImage = deleteProductImage;
exports.setPrimaryImage = setPrimaryImage;
exports.listSpecifications = listSpecifications;
exports.replaceSpecifications = replaceSpecifications;
exports.logInventoryMovement = logInventoryMovement;
exports.adjustStock = adjustStock;
exports.listInventoryLogs = listInventoryLogs;
exports.productStats = productStats;
const database_1 = require("../config/database");
const pagination_1 = require("../utils/pagination");
/** Logical sort field -> SQL expression (aliases live on the joined tables). */
const SORTABLE = {
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
function buildWhere(filters) {
    const where = [];
    const params = [];
    const search = (0, pagination_1.buildSearchFilter)(filters.search, ['p.name', 'p.sku', 'p.short_description']);
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
    }
    else {
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
    }
    else {
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
        where.push(`(SELECT AVG(r.rating) FROM reviews r
         WHERE r.product_id = p.id AND r.status = 'approved') >= ?`);
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
async function listProducts(filters) {
    const { sql: whereSql, params } = buildWhere(filters);
    const sortColumn = (0, pagination_1.safeSortExpression)(filters.sortBy, SORTABLE, 'id');
    const direction = filters.sortDir === 'asc' ? 'ASC' : 'DESC';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM products p JOIN categories c ON c.id = p.category_id
     LEFT JOIN brands b ON b.id = p.brand_id${whereSql}`, params);
    const total = Number(countRow?.total ?? 0);
    const rows = await (0, database_1.query)(`${PRODUCT_SELECT}${whereSql} ORDER BY ${sortColumn} ${direction}, p.id DESC LIMIT ? OFFSET ?`, [...params, filters.pageSize, (filters.page - 1) * filters.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, total, filters.page, filters.pageSize);
}
/**
 * Price bounds for the storefront's price slider.
 *
 * Uses the same WHERE builder as the listing, so the slider can never offer a
 * range outside the current collection.
 */
async function productPriceRange(filters) {
    const { sql: whereSql, params } = buildWhere(filters);
    const row = await (0, database_1.queryOne)(`SELECT MIN(COALESCE(p.sale_price, p.price)) AS min_price,
            MAX(COALESCE(p.sale_price, p.price)) AS max_price,
            COUNT(*) AS total
       FROM products p
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       ${whereSql}`, params);
    return {
        min_price: Number(row?.min_price ?? 0),
        max_price: Number(row?.max_price ?? 0),
        total: Number(row?.total ?? 0),
    };
}
async function findProductById(id) {
    return (0, database_1.queryOne)(`${PRODUCT_SELECT} WHERE p.id = ? LIMIT 1`, [id]);
}
async function findProductBySlug(slug) {
    return (0, database_1.queryOne)(`${PRODUCT_SELECT} WHERE p.slug = ? LIMIT 1`, [slug]);
}
async function skuExists(sku, excludeId) {
    const row = excludeId
        ? await (0, database_1.queryOne)('SELECT id FROM products WHERE sku = ? AND id <> ? LIMIT 1', [
            sku,
            excludeId,
        ])
        : await (0, database_1.queryOne)('SELECT id FROM products WHERE sku = ? LIMIT 1', [sku]);
    return row !== null;
}
async function slugExists(slug, excludeId) {
    const row = excludeId
        ? await (0, database_1.queryOne)('SELECT id FROM products WHERE slug = ? AND id <> ? LIMIT 1', [
            slug,
            excludeId,
        ])
        : await (0, database_1.queryOne)('SELECT id FROM products WHERE slug = ? LIMIT 1', [slug]);
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
async function createProduct(data) {
    const result = await (0, database_1.execute)(`INSERT INTO products
       (category_id, brand_id, sku, name, slug, short_description, description, price,
        sale_price, cost_price, weight, dimensions, stock_quantity, minimum_stock, featured, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
    ]);
    return result.insertId;
}
async function updateProduct(id, data) {
    const entries = Object.entries(data).filter(([key, value]) => PRODUCT_FIELDS.includes(key) && value !== undefined);
    if (entries.length === 0)
        return false;
    const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const params = entries.map(([key, value]) => {
        // MySQL TINYINT(1) expects 0/1 rather than true/false.
        if (key === 'featured')
            return value ? 1 : 0;
        return value;
    });
    const result = await (0, database_1.execute)(`UPDATE products SET ${setSql} WHERE id = ?`, [...params, id]);
    return result.affectedRows > 0;
}
/** Delete a product and its images/specs/reviews, logging the stock movement. */
async function deleteProduct(id, userId) {
    return (0, database_1.transaction)(async (connection) => {
        const [rows] = await connection.execute('SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE', [id]);
        if (rows.length === 0)
            return false;
        const stock = Number(rows[0].stock_quantity);
        if (stock > 0) {
            await connection.execute(`INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks, created_by)
         VALUES (?, 'adjustment', ?, 'DELETE', 'Product deleted from catalogue', ?)`, [id, -stock, userId]);
        }
        // product_images / product_specifications / reviews / cart_items / wishlists
        // cascade automatically via their foreign keys.
        const [result] = await connection.execute('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows > 0;
    });
}
// ------------------------------------------------------------------- images
async function listProductImages(productId) {
    return (0, database_1.query)('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC, id ASC', [productId]);
}
async function addProductImage(data) {
    return (0, database_1.transaction)(async (connection) => {
        if (data.is_primary) {
            await connection.execute('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [
                data.product_id,
            ]);
        }
        const [result] = await connection.execute(`INSERT INTO product_images (product_id, image, is_primary, sort_order) VALUES (?, ?, ?, ?)`, [data.product_id, data.image, data.is_primary ? 1 : 0, data.sort_order ?? 0]);
        return result.insertId;
    });
}
async function deleteProductImage(id) {
    const row = await (0, database_1.queryOne)('SELECT image FROM product_images WHERE id = ? LIMIT 1', [id]);
    if (!row)
        return null;
    await (0, database_1.execute)('DELETE FROM product_images WHERE id = ?', [id]);
    return { image: row.image };
}
async function setPrimaryImage(productId, imageId) {
    return (0, database_1.transaction)(async (connection) => {
        await connection.execute('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [
            productId,
        ]);
        const [result] = await connection.execute('UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?', [imageId, productId]);
        return result.affectedRows > 0;
    });
}
// ----------------------------------------------------------- specifications
async function listSpecifications(productId) {
    return (0, database_1.query)('SELECT * FROM product_specifications WHERE product_id = ? ORDER BY id ASC', [productId]);
}
async function replaceSpecifications(productId, specifications) {
    await (0, database_1.transaction)(async (connection) => {
        await connection.execute('DELETE FROM product_specifications WHERE product_id = ?', [productId]);
        for (const spec of specifications) {
            await connection.execute('INSERT INTO product_specifications (product_id, attribute_name, attribute_value) VALUES (?, ?, ?)', [productId, spec.attribute_name, spec.attribute_value]);
        }
    });
}
async function logInventoryMovement(data, connection) {
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
    }
    else {
        await (0, database_1.execute)(sql, params);
    }
}
/** Apply a signed stock delta and record the movement, atomically. */
async function adjustStock(data) {
    return (0, database_1.transaction)(async (connection) => {
        const [rows] = await connection.execute('SELECT stock_quantity, name, sku FROM products WHERE id = ? FOR UPDATE', [data.productId]);
        if (rows.length === 0)
            throw new Error('PRODUCT_NOT_FOUND');
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
        await connection.execute(`INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`, [data.productId, data.type, delta, data.reference ?? null, data.remarks ?? null, data.userId ?? null]);
        return { stock_quantity: next };
    });
}
async function listInventoryLogs(list) {
    const where = [];
    const params = [];
    if (list.filters.product_id) {
        where.push('il.product_id = ?');
        params.push(list.filters.product_id);
    }
    if (list.filters.type) {
        where.push('il.type = ?');
        params.push(list.filters.type);
    }
    const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM inventory_logs il ${whereSql}`, params);
    const total = Number(countRow?.total ?? 0);
    const rows = await (0, database_1.query)(`SELECT il.*, p.name AS product_name, p.sku, u.full_name AS user_name
       FROM inventory_logs il
       JOIN products p ON p.id = il.product_id
       LEFT JOIN users u ON u.id = il.created_by
       ${whereSql}
      ORDER BY il.created_at DESC, il.id DESC
      LIMIT ? OFFSET ?`, [...params, list.pageSize, (list.page - 1) * list.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, total, list.page, list.pageSize);
}
async function productStats() {
    return ((await (0, database_1.queryOne)(`
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
    `)) ?? {});
}
//# sourceMappingURL=product.model.js.map