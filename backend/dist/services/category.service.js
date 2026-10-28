"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
exports.getCategoryTree = getCategoryTree;
exports.getCategory = getCategory;
exports.createNewCategory = createNewCategory;
exports.updateExistingCategory = updateExistingCategory;
exports.removeCategory = removeCategory;
exports.exportCategories = exportCategories;
exports.notifyIfOrphaned = notifyIfOrphaned;
const database_1 = require("../config/database");
const ApiError_1 = require("../utils/ApiError");
const sanitize_1 = require("../utils/sanitize");
const csv_1 = require("../utils/csv");
const category_model_1 = require("../models/category.model");
const upload_1 = require("../middleware/upload");
const notification_model_1 = require("../models/notification.model");
async function uniqueSlug(base, excludeId) {
    let slug = base;
    let suffix = 1;
    while (await (0, category_model_1.slugExists)('categories', slug, excludeId)) {
        suffix += 1;
        slug = `${base}-${suffix}`;
        if (suffix > 200)
            return `${base}-${Date.now()}`;
    }
    return slug;
}
/** Reject a parent that would create a cycle in the category tree. */
async function assertValidParent(categoryId, parentId) {
    if (parentId === null)
        return;
    if (parentId === categoryId)
        throw ApiError_1.ApiError.badRequest('A category cannot be its own parent');
    // Walk up from the proposed parent; if we meet the category itself, it's a cycle.
    // The `seen` set also bounds this loop, so a pre-existing cycle in the data
    // cannot spin here forever.
    let cursor = parentId;
    const seen = new Set();
    while (cursor !== null) {
        if (cursor === categoryId) {
            throw ApiError_1.ApiError.badRequest('That parent would create a circular category hierarchy');
        }
        if (seen.has(cursor))
            break;
        seen.add(cursor);
        const rows = await (0, database_1.query)('SELECT parent_id FROM categories WHERE id = ? LIMIT 1', [cursor]);
        if (rows.length === 0)
            break;
        cursor = rows[0].parent_id === null ? null : Number(rows[0].parent_id);
    }
}
async function getCategories(list) {
    return (0, category_model_1.listCategories)(list);
}
/**
 * The storefront's category tree.
 *
 * `categoryTree()` returns flat rows for the admin selects. The public endpoint
 * promises nested children (the header menu, footer and collection pages all
 * read `category.children`), so nest them here in one pass.
 */
async function getCategoryTree() {
    const rows = await (0, category_model_1.categoryTree)();
    const nodes = new Map();
    for (const row of rows) {
        nodes.set(Number(row.id), { ...row, children: [] });
    }
    const roots = [];
    for (const node of nodes.values()) {
        const parent = node.parent_id === null ? undefined : nodes.get(Number(node.parent_id));
        if (parent)
            parent.children.push(node);
        else
            roots.push(node);
    }
    return roots;
}
async function getCategory(id) {
    const category = await (0, category_model_1.findCategoryById)(id);
    if (!category)
        throw ApiError_1.ApiError.notFound('Category not found');
    const children = await (0, database_1.query)('SELECT id, name, slug, status FROM categories WHERE parent_id = ? ORDER BY name', [id]);
    return { ...category, children };
}
async function createNewCategory(data) {
    const name = String(data.name);
    const id = await (0, category_model_1.createCategory)({
        name,
        slug: await uniqueSlug(String(data.slug || (0, sanitize_1.slugify)(name))),
        parent_id: data.parent_id ? Number(data.parent_id) : null,
        image: data.image ?? null,
        description: data.description ?? null,
        status: data.status ?? 'active',
    });
    return (0, category_model_1.findCategoryById)(id);
}
async function updateExistingCategory(id, data) {
    const existing = await (0, category_model_1.findCategoryById)(id);
    if (!existing)
        throw ApiError_1.ApiError.notFound('Category not found');
    if (data.parent_id !== undefined) {
        await assertValidParent(id, data.parent_id ? Number(data.parent_id) : null);
    }
    const patch = {};
    if (data.name !== undefined)
        patch.name = String(data.name);
    if (data.slug !== undefined)
        patch.slug = await uniqueSlug(String(data.slug), id);
    if (data.parent_id !== undefined)
        patch.parent_id = data.parent_id ? Number(data.parent_id) : null;
    if (data.image !== undefined)
        patch.image = data.image === null ? null : String(data.image);
    if (data.description !== undefined) {
        patch.description = data.description === null ? null : String(data.description);
    }
    if (data.status !== undefined)
        patch.status = data.status;
    await (0, category_model_1.updateCategory)(id, patch);
    return (0, category_model_1.findCategoryById)(id);
}
async function removeCategory(id) {
    const existing = await (0, category_model_1.findCategoryById)(id);
    if (!existing)
        throw ApiError_1.ApiError.notFound('Category not found');
    const children = await (0, category_model_1.countChildren)(id);
    if (children > 0) {
        throw ApiError_1.ApiError.badRequest(`This category has ${children} sub-categor${children === 1 ? 'y' : 'ies'}. Remove or reassign them first.`);
    }
    const products = await (0, category_model_1.countProducts)(id);
    if (products > 0) {
        throw ApiError_1.ApiError.badRequest(`This category still holds ${products} product${products === 1 ? '' : 's'}. Move or delete them first.`);
    }
    await (0, category_model_1.deleteCategory)(id);
    if (existing.image)
        (0, upload_1.removeUploadedFile)(existing.image);
    return true;
}
async function exportCategories(list, format) {
    const result = await getCategories({ ...list, page: 1, pageSize: 10000 });
    if (format === 'json') {
        return {
            body: JSON.stringify(result.data, null, 2),
            mimeType: 'application/json',
            filename: `categories-export-${Date.now()}.json`,
        };
    }
    const csv = (0, csv_1.toCsv)(result.data, [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Name' },
        { key: 'slug', header: 'Slug' },
        { key: 'parent_name', header: 'Parent', map: (row) => row.parent_name ?? '—' },
        { key: 'product_count', header: 'Products' },
        { key: 'status', header: 'Status' },
        { key: 'created_at', header: 'Created At' },
    ]);
    return { body: csv, mimeType: 'text/csv; charset=utf-8', filename: `categories-export-${Date.now()}.csv` };
}
/** Warn staff when a category or brand ends up with no products. */
async function notifyIfOrphaned(name, kind) {
    await (0, notification_model_1.notifyStaff)({
        title: `${kind === 'category' ? 'Category' : 'Brand'} has no products`,
        message: `"${name}" currently has no products assigned to it.`,
        type: 'warning',
        link: kind === 'category' ? '/admin/categories' : '/admin/brands',
    });
}
//# sourceMappingURL=category.service.js.map