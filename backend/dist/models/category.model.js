"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.categoryTree = categoryTree;
exports.findCategoryById = findCategoryById;
exports.findCategoryBySlug = findCategoryBySlug;
exports.slugExists = slugExists;
exports.countChildren = countChildren;
exports.countProducts = countProducts;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const database_1 = require("../config/database");
const pagination_1 = require("../utils/pagination");
/** Logical sort field -> SQL expression (`product_count` is a SELECT subquery alias). */
const SORTABLE = {
    id: 'c.id',
    name: 'c.name',
    slug: 'c.slug',
    status: 'c.status',
    created_at: 'c.created_at',
    product_count: 'product_count',
};
async function listCategories(list) {
    const where = [];
    const params = [];
    const search = (0, pagination_1.buildSearchFilter)(list.search, ['c.name', 'c.slug', 'c.description']);
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
    const sortColumn = (0, pagination_1.safeSortExpression)(list.sortBy, SORTABLE, 'id');
    const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM categories c ${whereSql}`, params);
    const total = Number(countRow?.total ?? 0);
    const rows = await (0, database_1.query)(`SELECT c.*, p.name AS parent_name,
            (SELECT COUNT(*) FROM products pr WHERE pr.category_id = c.id) AS product_count
       FROM categories c
       LEFT JOIN categories p ON p.id = c.parent_id
       ${whereSql}
      ORDER BY ${sortColumn} ${direction}, c.id DESC
      LIMIT ? OFFSET ?`, [...params, list.pageSize, (list.page - 1) * list.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, total, list.page, list.pageSize);
}
/** Full tree, used to populate the parent <select> without N+1 queries. */
async function categoryTree() {
    return (0, database_1.query)(`SELECT c.id, c.parent_id, c.name, c.slug, c.status,
            (SELECT COUNT(*) FROM products pr WHERE pr.category_id = c.id) AS product_count
       FROM categories c
      ORDER BY c.name ASC`);
}
async function findCategoryById(id) {
    return (0, database_1.queryOne)(`SELECT c.*, p.name AS parent_name,
            (SELECT COUNT(*) FROM products pr WHERE pr.category_id = c.id) AS product_count
       FROM categories c
       LEFT JOIN categories p ON p.id = c.parent_id
      WHERE c.id = ? LIMIT 1`, [id]);
}
async function findCategoryBySlug(slug) {
    return (0, database_1.queryOne)('SELECT * FROM categories WHERE slug = ? LIMIT 1', [slug]);
}
async function slugExists(table, slug, excludeId) {
    const row = excludeId
        ? await (0, database_1.queryOne)(`SELECT id FROM \`${table}\` WHERE slug = ? AND id <> ? LIMIT 1`, [slug, excludeId])
        : await (0, database_1.queryOne)(`SELECT id FROM \`${table}\` WHERE slug = ? LIMIT 1`, [slug]);
    return row !== null;
}
/** Direct children of a category — used to block deletes that would orphan rows. */
async function countChildren(id) {
    const row = await (0, database_1.queryOne)('SELECT COUNT(*) AS total FROM categories WHERE parent_id = ?', [id]);
    return Number(row?.total ?? 0);
}
async function countProducts(id) {
    const row = await (0, database_1.queryOne)('SELECT COUNT(*) AS total FROM products WHERE category_id = ?', [id]);
    return Number(row?.total ?? 0);
}
async function createCategory(data) {
    const result = await (0, database_1.execute)(`INSERT INTO categories (parent_id, name, slug, image, description, status)
     VALUES (?, ?, ?, ?, ?, ?)`, [
        data.parent_id ?? null,
        data.name,
        data.slug,
        data.image ?? null,
        data.description ?? null,
        data.status ?? 'active',
    ]);
    return result.insertId;
}
async function updateCategory(id, data) {
    const fields = ['parent_id', 'name', 'slug', 'image', 'description', 'status'];
    const entries = Object.entries(data).filter(([key, value]) => fields.includes(key) && value !== undefined);
    if (entries.length === 0)
        return false;
    const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const result = await (0, database_1.execute)(`UPDATE categories SET ${setSql} WHERE id = ?`, [
        ...entries.map(([, value]) => value),
        id,
    ]);
    return result.affectedRows > 0;
}
async function deleteCategory(id) {
    const result = await (0, database_1.execute)('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
//# sourceMappingURL=category.model.js.map