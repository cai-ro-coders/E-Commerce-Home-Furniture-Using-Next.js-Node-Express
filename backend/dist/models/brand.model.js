"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBrands = listBrands;
exports.listAllBrands = listAllBrands;
exports.findBrandById = findBrandById;
exports.findBrandBySlug = findBrandBySlug;
exports.countBrandProducts = countBrandProducts;
exports.createBrand = createBrand;
exports.updateBrand = updateBrand;
exports.deleteBrand = deleteBrand;
const database_1 = require("../config/database");
const pagination_1 = require("../utils/pagination");
/** Logical sort field -> SQL expression (`product_count` is a SELECT subquery alias). */
const SORTABLE = {
    id: 'b.id',
    name: 'b.name',
    slug: 'b.slug',
    status: 'b.status',
    created_at: 'b.created_at',
    product_count: 'product_count',
};
async function listBrands(list) {
    const where = [];
    const params = [];
    const search = (0, pagination_1.buildSearchFilter)(list.search, ['b.name', 'b.slug', 'b.description']);
    if (search.clause) {
        where.push(search.clause);
        params.push(...search.params);
    }
    if (list.filters.status) {
        where.push('b.status = ?');
        params.push(list.filters.status);
    }
    const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const sortColumn = (0, pagination_1.safeSortExpression)(list.sortBy, SORTABLE, 'id');
    const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM brands b ${whereSql}`, params);
    const total = Number(countRow?.total ?? 0);
    const rows = await (0, database_1.query)(`SELECT b.*, (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id) AS product_count
       FROM brands b
       ${whereSql}
      ORDER BY ${sortColumn} ${direction}, b.id DESC
      LIMIT ? OFFSET ?`, [...params, list.pageSize, (list.page - 1) * list.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, total, list.page, list.pageSize);
}
async function listAllBrands() {
    return (0, database_1.query)(`SELECT id, name, slug, logo, status FROM brands ORDER BY name ASC`);
}
async function findBrandById(id) {
    return (0, database_1.queryOne)(`SELECT b.*, (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id) AS product_count
       FROM brands b WHERE b.id = ? LIMIT 1`, [id]);
}
async function findBrandBySlug(slug) {
    return (0, database_1.queryOne)('SELECT * FROM brands WHERE slug = ? LIMIT 1', [slug]);
}
async function countBrandProducts(id) {
    const row = await (0, database_1.queryOne)('SELECT COUNT(*) AS total FROM products WHERE brand_id = ?', [id]);
    return Number(row?.total ?? 0);
}
async function createBrand(data) {
    const result = await (0, database_1.execute)(`INSERT INTO brands (name, slug, logo, description, status) VALUES (?, ?, ?, ?, ?)`, [data.name, data.slug, data.logo ?? null, data.description ?? null, data.status ?? 'active']);
    return result.insertId;
}
async function updateBrand(id, data) {
    const fields = ['name', 'slug', 'logo', 'description', 'status'];
    const entries = Object.entries(data).filter(([key, value]) => fields.includes(key) && value !== undefined);
    if (entries.length === 0)
        return false;
    const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const result = await (0, database_1.execute)(`UPDATE brands SET ${setSql} WHERE id = ?`, [
        ...entries.map(([, value]) => value),
        id,
    ]);
    return result.affectedRows > 0;
}
async function deleteBrand(id) {
    const result = await (0, database_1.execute)('DELETE FROM brands WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
//# sourceMappingURL=brand.model.js.map