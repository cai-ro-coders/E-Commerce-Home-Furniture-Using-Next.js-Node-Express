import { query } from '../config/database';
import type { RowDataPacket } from 'mysql2';
import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/sanitize';
import { toCsv } from '../utils/csv';
import {
  categoryTree,
  countChildren,
  countProducts,
  createCategory,
  deleteCategory,
  findCategoryById,
  listCategories,
  slugExists,
  updateCategory,
  type CategoryRecord,
  type CategoryTreeNode,
} from '../models/category.model';
import { removeUploadedFile } from '../middleware/upload';
import { notifyStaff } from '../models/notification.model';
import type { ListQuery } from '../types';

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  let slug = base;
  let suffix = 1;
  while (await slugExists('categories', slug, excludeId)) {
    suffix += 1;
    slug = `${base}-${suffix}`;
    if (suffix > 200) return `${base}-${Date.now()}`;
  }
  return slug;
}

/** Reject a parent that would create a cycle in the category tree. */
async function assertValidParent(categoryId: number, parentId: number | null): Promise<void> {
  if (parentId === null) return;
  if (parentId === categoryId) throw ApiError.badRequest('A category cannot be its own parent');

  // Walk up from the proposed parent; if we meet the category itself, it's a cycle.
  // The `seen` set also bounds this loop, so a pre-existing cycle in the data
  // cannot spin here forever.
  let cursor: number | null = parentId;
  const seen = new Set<number>();
  while (cursor !== null) {
    if (cursor === categoryId) {
      throw ApiError.badRequest('That parent would create a circular category hierarchy');
    }
    if (seen.has(cursor)) break;
    seen.add(cursor);

    const rows: RowDataPacket[] = await query(
      'SELECT parent_id FROM categories WHERE id = ? LIMIT 1',
      [cursor]
    );
    if (rows.length === 0) break;
    cursor = rows[0].parent_id === null ? null : Number(rows[0].parent_id);
  }
}

export async function getCategories(list: ListQuery) {
  return listCategories(list);
}

/**
 * The storefront's category tree.
 *
 * `categoryTree()` returns flat rows for the admin selects. The public endpoint
 * promises nested children (the header menu, footer and collection pages all
 * read `category.children`), so nest them here in one pass.
 */
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const rows = await categoryTree();
  const nodes = new Map<number, CategoryTreeNode>();

  for (const row of rows) {
    nodes.set(Number(row.id), { ...row, children: [] });
  }

  const roots: CategoryTreeNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parent_id === null ? undefined : nodes.get(Number(node.parent_id));
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  return roots;
}

export async function getCategory(id: number) {
  const category = await findCategoryById(id);
  if (!category) throw ApiError.notFound('Category not found');
  const children = await query('SELECT id, name, slug, status FROM categories WHERE parent_id = ? ORDER BY name', [id]);
  return { ...category, children };
}

export async function createNewCategory(data: Record<string, unknown>) {
  const name = String(data.name);
  const id = await createCategory({
    name,
    slug: await uniqueSlug(String(data.slug || slugify(name))),
    parent_id: data.parent_id ? Number(data.parent_id) : null,
    image: (data.image as string) ?? null,
    description: (data.description as string) ?? null,
    status: (data.status as 'active' | 'inactive') ?? 'active',
  });
  return findCategoryById(id);
}

export async function updateExistingCategory(id: number, data: Record<string, unknown>) {
  const existing = await findCategoryById(id);
  if (!existing) throw ApiError.notFound('Category not found');

  if (data.parent_id !== undefined) {
    await assertValidParent(id, data.parent_id ? Number(data.parent_id) : null);
  }

  const patch: Partial<CategoryRecord> = {};
  if (data.name !== undefined) patch.name = String(data.name);
  if (data.slug !== undefined) patch.slug = await uniqueSlug(String(data.slug), id);
  if (data.parent_id !== undefined) patch.parent_id = data.parent_id ? Number(data.parent_id) : null;
  if (data.image !== undefined) patch.image = data.image === null ? null : String(data.image);
  if (data.description !== undefined) {
    patch.description = data.description === null ? null : String(data.description);
  }
  if (data.status !== undefined) patch.status = data.status as CategoryRecord['status'];

  await updateCategory(id, patch);
  return findCategoryById(id);
}

export async function removeCategory(id: number) {
  const existing = await findCategoryById(id);
  if (!existing) throw ApiError.notFound('Category not found');

  const children = await countChildren(id);
  if (children > 0) {
    throw ApiError.badRequest(
      `This category has ${children} sub-categor${children === 1 ? 'y' : 'ies'}. Remove or reassign them first.`
    );
  }

  const products = await countProducts(id);
  if (products > 0) {
    throw ApiError.badRequest(
      `This category still holds ${products} product${products === 1 ? '' : 's'}. Move or delete them first.`
    );
  }

  await deleteCategory(id);
  if (existing.image) removeUploadedFile(existing.image);
  return true;
}

export async function exportCategories(list: ListQuery, format: 'csv' | 'json') {
  const result = await getCategories({ ...list, page: 1, pageSize: 10000 });

  if (format === 'json') {
    return {
      body: JSON.stringify(result.data, null, 2),
      mimeType: 'application/json',
      filename: `categories-export-${Date.now()}.json`,
    };
  }

  const csv = toCsv(result.data, [
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
export async function notifyIfOrphaned(name: string, kind: 'category' | 'brand'): Promise<void> {
  await notifyStaff({
    title: `${kind === 'category' ? 'Category' : 'Brand'} has no products`,
    message: `"${name}" currently has no products assigned to it.`,
    type: 'warning',
    link: kind === 'category' ? '/admin/categories' : '/admin/brands',
  });
}
