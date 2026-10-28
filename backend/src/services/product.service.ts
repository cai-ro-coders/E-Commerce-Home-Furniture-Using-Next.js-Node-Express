import { query, queryOne } from '../config/database';
import type { RowDataPacket } from 'mysql2';
import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/sanitize';
import { toCsv } from '../utils/csv';
import { removeUploadedFile } from '../middleware/upload';
import {
  addProductImage,
  adjustStock,
  createProduct,
  deleteProduct,
  deleteProductImage,
  findProductById,
  listInventoryLogs,
  listProductImages,
  listProducts,
  listSpecifications,
  productPriceRange,
  productStats,
  replaceSpecifications,
  setPrimaryImage,
  skuExists,
  slugExists as productSlugExists,
  updateProduct,
} from '../models/product.model';
import { categoryTree } from '../models/category.model';
import { listAllBrands } from '../models/brand.model';
import type { ListQuery, ProductStatus } from '../types';

export interface ProductFiltersInput extends ListQuery {
  categoryId?: number;
  /** A category and all of its descendants, used by collection pages. */
  categoryIds?: number[];
  brandId?: number;
  brandIds?: number[];
  status?: ProductStatus;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  lowStock?: boolean;
  outOfStock?: boolean;
  /** Storefront-only: keep only products whose `sale_price` is set. */
  onSale?: boolean;
  /** Storefront-only: keep only products with stock on hand. */
  inStock?: boolean;
}

/** Ensure a slug is unique by appending -2, -3, ... when needed. */
async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  let slug = base;
  let suffix = 1;
  // Bounded loop: guarantees termination even on pathological data.
  while (await productSlugExists(slug, excludeId)) {
    suffix += 1;
    slug = `${base}-${suffix}`;
    if (suffix > 200) {
      slug = `${base}-${Date.now()}`;
      break;
    }
  }
  return slug;
}

async function uniqueSku(base: string | undefined, name: string, excludeId?: number): Promise<string> {
  // Derive a readable SKU from the product name when one is not supplied.
  const candidate = (base?.trim() || name)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const seed = candidate || 'PROD';

  let sku = seed;
  let suffix = 1;
  while (await skuExists(sku, excludeId)) {
    suffix += 1;
    sku = `${seed}-${suffix}`;
    if (suffix > 9999) {
      sku = `${seed}-${Date.now()}`;
      break;
    }
  }
  return sku;
}

async function assertCategoryExists(categoryId: number): Promise<void> {
  const row = await queryOne<RowDataPacket & { id: number }>('SELECT id FROM categories WHERE id = ? LIMIT 1', [
    categoryId,
  ]);
  if (!row) throw ApiError.badRequest('The selected category does not exist');
}

async function assertBrandExists(brandId: number): Promise<void> {
  const row = await queryOne<RowDataPacket & { id: number }>('SELECT id FROM brands WHERE id = ? LIMIT 1', [brandId]);
  if (!row) throw ApiError.badRequest('The selected brand does not exist');
}

export async function getProducts(filters: ProductFiltersInput) {
  return listProducts(filters);
}

export async function getProduct(id: number) {
  const product = await findProductById(id);
  if (!product) throw ApiError.notFound('Product not found');

  const [images, specifications, inventory] = await Promise.all([
    listProductImages(id),
    listSpecifications(id),
    listInventoryLogs({ page: 1, pageSize: 20, search: '', sortBy: 'id', sortDir: 'desc', filters: { productId: String(id) } }),
  ]);

  return { ...product, images, specifications, inventory: inventory.data };
}

export async function createNewProduct(
  data: Record<string, unknown>,
  actorId: number | null
) {
  const categoryId = Number(data.category_id);
  await assertCategoryExists(categoryId);
  if (data.brand_id) await assertBrandExists(Number(data.brand_id));

  const name = String(data.name);
  const slug = await uniqueSlug(String(data.slug || slugify(name)));
  const sku = await uniqueSku(data.sku as string | undefined, name);

  const id = await createProduct({
    category_id: categoryId,
    brand_id: data.brand_id ? Number(data.brand_id) : null,
    sku,
    name,
    slug,
    short_description: (data.short_description as string) ?? null,
    description: (data.description as string) ?? null,
    price: Number(data.price),
    sale_price: data.sale_price === undefined || data.sale_price === null ? null : Number(data.sale_price),
    cost_price: data.cost_price === undefined || data.cost_price === null ? null : Number(data.cost_price),
    weight: data.weight === undefined || data.weight === null ? null : Number(data.weight),
    dimensions: (data.dimensions as string) ?? null,
    stock_quantity: Number(data.stock_quantity ?? 0),
    minimum_stock: Number(data.minimum_stock ?? 5),
    featured: data.featured ? 1 : 0,
    status: (data.status as ProductStatus) ?? 'active',
  });

  // The single `image` field from the form becomes the primary product image.
  if (data.image) {
    await addProductImage({ product_id: id, image: String(data.image), is_primary: true, sort_order: 0 });
  }

  if (Number(data.stock_quantity ?? 0) > 0) {
    await adjustStock({
      productId: id,
      type: 'stock_in',
      quantity: Number(data.stock_quantity),
      reference: 'INITIAL',
      remarks: 'Opening stock on product creation',
      userId: actorId,
    });
  }

  return getProduct(id);
}

export async function updateNewProduct(id: number, data: Record<string, unknown>) {
  const existing = await findProductById(id);
  if (!existing) throw ApiError.notFound('Product not found');

  const patch: Record<string, unknown> = {};

  if (data.name !== undefined) patch.name = data.name;
  if (data.category_id !== undefined) {
    await assertCategoryExists(Number(data.category_id));
    patch.category_id = Number(data.category_id);
  }
  if (data.brand_id !== undefined) {
    if (data.brand_id) await assertBrandExists(Number(data.brand_id));
    patch.brand_id = data.brand_id ? Number(data.brand_id) : null;
  }
  if (data.slug !== undefined) patch.slug = await uniqueSlug(String(data.slug), id);
  if (data.short_description !== undefined) patch.short_description = data.short_description;
  if (data.description !== undefined) patch.description = data.description;
  if (data.price !== undefined) patch.price = Number(data.price);
  if (data.sale_price !== undefined) {
    patch.sale_price = data.sale_price === null || data.sale_price === '' ? null : Number(data.sale_price);
  }
  if (data.cost_price !== undefined) {
    patch.cost_price = data.cost_price === null || data.cost_price === '' ? null : Number(data.cost_price);
  }
  if (data.weight !== undefined) patch.weight = data.weight === null ? null : Number(data.weight);
  if (data.dimensions !== undefined) patch.dimensions = data.dimensions;
  if (data.minimum_stock !== undefined) patch.minimum_stock = Number(data.minimum_stock);
  if (data.featured !== undefined) patch.featured = data.featured;
  if (data.status !== undefined) patch.status = data.status;

  // Re-validate the sale price against the *effective* price after the merge,
  // otherwise lowering `price` below an existing `sale_price` would violate the
  // table's CHECK constraint with a confusing 500.
  const effectivePrice = patch.price !== undefined ? Number(patch.price) : Number(existing.price);
  const effectiveSale =
    'sale_price' in patch
      ? (patch.sale_price as number | null)
      : (existing.sale_price === null ? null : Number(existing.sale_price));
  if (effectiveSale !== null && effectiveSale >= effectivePrice) {
    throw ApiError.badRequest('Sale price must be lower than the regular price');
  }

  await updateProduct(id, patch);

  if (data.image) {
    const images = await listProductImages(id);
    if (images.length === 0) {
      await addProductImage({ product_id: id, image: String(data.image), is_primary: true, sort_order: 0 });
    }
  }

  return getProduct(id);
}

export async function removeProduct(id: number, actorId: number | null) {
  const images = await listProductImages(id);
  const deleted = await deleteProduct(id, actorId);
  if (deleted) {
    // Clean up orphaned files on disk after the rows are gone.
    for (const image of images) removeUploadedFile(image.image);
  }
  return deleted;
}

// ------------------------------------------------------------------ images
export async function getProductImages(productId: number) {
  const product = await findProductById(productId);
  if (!product) throw ApiError.notFound('Product not found');
  return listProductImages(productId);
}

export async function addImage(
  productId: number,
  data: { image: string; is_primary?: boolean; sort_order?: number }
) {
  const product = await findProductById(productId);
  if (!product) throw ApiError.notFound('Product not found');
  const id = await addProductImage({ product_id: productId, ...data });
  return { id, images: await listProductImages(productId) };
}

export async function removeImage(productId: number, imageId: number) {
  const row = await queryOne<RowDataPacket & { product_id: number }>(
    'SELECT product_id FROM product_images WHERE id = ? LIMIT 1',
    [imageId]
  );
  if (!row || row.product_id !== productId) throw ApiError.notFound('Image not found');

  const removed = await deleteProductImage(imageId);
  if (removed) removeUploadedFile(removed.image);
  return listProductImages(productId);
}

export async function makePrimaryImage(productId: number, imageId: number) {
  const done = await setPrimaryImage(productId, imageId);
  if (!done) throw ApiError.notFound('Image not found');
  return listProductImages(productId);
}

// ---------------------------------------------------------- specifications
export async function getSpecifications(productId: number) {
  return listSpecifications(productId);
}

export async function saveSpecifications(
  productId: number,
  specs: Array<{ attribute_name: string; attribute_value: string }>
) {
  const product = await findProductById(productId);
  if (!product) throw ApiError.notFound('Product not found');
  await replaceSpecifications(productId, specs);
  return listSpecifications(productId);
}

// -------------------------------------------------------------- inventory
export async function adjustProductStock(
  productId: number,
  data: { type: 'stock_in' | 'stock_out' | 'adjustment' | 'return'; quantity: number; reference?: string; remarks?: string },
  actorId: number | null
) {
  try {
    const result = await adjustStock({ productId, ...data, userId: actorId });
    return result;
  } catch (error) {
    if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') {
      throw ApiError.badRequest('Cannot reduce stock below zero');
    }
    if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
      throw ApiError.notFound('Product not found');
    }
    throw error;
  }
}

export async function getInventoryLogs(list: ListQuery) {
  return listInventoryLogs(list);
}

export async function getProductStats() {
  return productStats();
}

// ------------------------------------------------------------------ export
export async function exportProducts(filters: ProductFiltersInput, format: 'csv' | 'json') {
  // Reuse the same filter pipeline but pull a large single page.
  const result = await listProducts({
    ...filters,
    page: 1,
    pageSize: 10000,
  });

  if (format === 'json') {
    return {
      body: JSON.stringify(
        result.data.map((row) => ({
          id: row.id,
          sku: row.sku,
          name: row.name,
          slug: row.slug,
          category: row.category_name,
          brand: row.brand_name,
          price: row.price,
          sale_price: row.sale_price,
          cost_price: row.cost_price,
          stock_quantity: row.stock_quantity,
          minimum_stock: row.minimum_stock,
          featured: Boolean(row.featured),
          status: row.status,
          created_at: row.created_at,
        })),
        null,
        2
      ),
      mimeType: 'application/json',
      filename: `products-export-${Date.now()}.json`,
    };
  }

  const csv = toCsv(result.data, [
    { key: 'id', header: 'ID' },
    { key: 'sku', header: 'SKU' },
    { key: 'name', header: 'Name' },
    { key: 'category_name', header: 'Category' },
    { key: 'brand_name', header: 'Brand' },
    { key: 'price', header: 'Price' },
    { key: 'sale_price', header: 'Sale Price' },
    { key: 'cost_price', header: 'Cost Price' },
    { key: 'stock_quantity', header: 'Stock' },
    { key: 'minimum_stock', header: 'Min Stock' },
    { key: 'status', header: 'Status' },
    { key: 'featured', header: 'Featured', map: (row) => (row.featured ? 'Yes' : 'No') },
    { key: 'created_at', header: 'Created At' },
  ]);

  return { body: csv, mimeType: 'text/csv; charset=utf-8', filename: `products-export-${Date.now()}.csv` };
}

/** Reference data for the product form's category/brand selects. */
export async function getFormOptions() {
  const [categories, brands] = await Promise.all([categoryTree(), listAllBrands()]);
  return { categories, brands };
}

/** Price bounds for the storefront filter sidebar. */
export async function browseFacets(filters: ProductFiltersInput) {
  return productPriceRange({ ...filters, status: 'active' });
}

/** Public storefront listing: active products only, with wishlist counts. */
export async function browseProducts(filters: ProductFiltersInput, userId: number | null) {
  const result = await listProducts({
    ...filters,
    // The storefront must never leak a draft or archived listing, whatever the
    // caller passed, so `status` is forced rather than merged.
    status: 'active',
  });

  const productIds = result.data.map((row) => row.id);
  let wishlistMap = new Map<number, number>();
  if (userId && productIds.length > 0) {
    const placeholders = productIds.map(() => '?').join(', ');
    const rows = await query<RowDataPacket & { product_id: number }>(
      `SELECT product_id FROM wishlists WHERE user_id = ? AND product_id IN (${placeholders})`,
      [userId, ...productIds]
    );
    wishlistMap = new Map(rows.map((row) => [Number(row.product_id), 1]));
  }

  return {
    ...result,
    data: result.data.map((row) => ({
      ...row,
      in_wishlist: wishlistMap.has(row.id),
      on_sale: row.sale_price !== null,
    })),
  };
}
