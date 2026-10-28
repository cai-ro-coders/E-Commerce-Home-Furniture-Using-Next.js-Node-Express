import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/sanitize';
import { toCsv } from '../utils/csv';
import {
  countBrandProducts,
  createBrand,
  deleteBrand,
  findBrandById,
  listAllBrands,
  listBrands,
  updateBrand,
  type BrandRecord,
} from '../models/brand.model';
import { slugExists } from '../models/category.model';
import { removeUploadedFile } from '../middleware/upload';
import type { ListQuery } from '../types';

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  let slug = base;
  let suffix = 1;
  while (await slugExists('brands', slug, excludeId)) {
    suffix += 1;
    slug = `${base}-${suffix}`;
    if (suffix > 200) return `${base}-${Date.now()}`;
  }
  return slug;
}

export async function getBrands(list: ListQuery) {
  return listBrands(list);
}

export async function getAllBrands() {
  return listAllBrands();
}

export async function getBrand(id: number) {
  const brand = await findBrandById(id);
  if (!brand) throw ApiError.notFound('Brand not found');
  return brand;
}

export async function createNewBrand(data: Record<string, unknown>) {
  const name = String(data.name);
  const id = await createBrand({
    name,
    slug: await uniqueSlug(String(data.slug || slugify(name))),
    logo: (data.logo as string) ?? null,
    description: (data.description as string) ?? null,
    status: (data.status as 'active' | 'inactive') ?? 'active',
  });
  return findBrandById(id);
}

export async function updateExistingBrand(id: number, data: Record<string, unknown>) {
  const existing = await findBrandById(id);
  if (!existing) throw ApiError.notFound('Brand not found');

  const patch: Partial<BrandRecord> = {};
  if (data.name !== undefined) patch.name = String(data.name);
  if (data.slug !== undefined) patch.slug = await uniqueSlug(String(data.slug), id);
  if (data.logo !== undefined) patch.logo = String(data.logo);
  if (data.description !== undefined) patch.description = String(data.description);
  if (data.status !== undefined) patch.status = data.status as BrandRecord['status'];

  await updateBrand(id, patch);
  return findBrandById(id);
}

export async function removeBrand(id: number) {
  const existing = await findBrandById(id);
  if (!existing) throw ApiError.notFound('Brand not found');

  const products = await countBrandProducts(id);
  if (products > 0) {
    // brands.product_id is ON DELETE SET NULL, so this is safe, but warn the
    // user because those products would become brand-less.
    throw ApiError.badRequest(
      `${products} product${products === 1 ? '' : 's'} still use this brand. Reassign them first, or delete the brand and the products will become brand-less.`,
      { product_count: products, allow_force: true }
    );
  }

  await deleteBrand(id);
  if (existing.logo) removeUploadedFile(existing.logo);
  return true;
}

/** Explicit opt-in for the force-delete path described in `removeBrand`. */
export async function forceRemoveBrand(id: number) {
  const existing = await findBrandById(id);
  if (!existing) throw ApiError.notFound('Brand not found');
  await deleteBrand(id);
  if (existing.logo) removeUploadedFile(existing.logo);
  return true;
}

export async function exportBrands(list: ListQuery, format: 'csv' | 'json') {
  const result = await listBrands({ ...list, page: 1, pageSize: 10000 });

  if (format === 'json') {
    return {
      body: JSON.stringify(result.data, null, 2),
      mimeType: 'application/json',
      filename: `brands-export-${Date.now()}.json`,
    };
  }

  const csv = toCsv(result.data, [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'slug', header: 'Slug' },
    { key: 'product_count', header: 'Products' },
    { key: 'status', header: 'Status' },
    { key: 'created_at', header: 'Created At' },
  ]);
  return { body: csv, mimeType: 'text/csv; charset=utf-8', filename: `brands-export-${Date.now()}.csv` };
}
