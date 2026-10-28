import path from 'path';
import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok, paginated } from '../utils/ApiResponse';
import { parseListQuery } from '../utils/pagination';
import { ApiError } from '../utils/ApiError';
import {
  addImage,
  adjustProductStock,
  browseFacets,
  browseProducts,
  createNewProduct,
  exportProducts,
  getFormOptions,
  getInventoryLogs,
  getProduct,
  getProductImages,
  getProductStats,
  getProducts,
  getSpecifications,
  makePrimaryImage,
  removeImage,
  removeProduct,
  saveSpecifications,
  updateNewProduct,
  type ProductFiltersInput,
} from '../services/product.service';
import { getProductReviews } from '../services/review.service';
import { toPublicPath } from '../middleware/upload';
import { queryOne } from '../config/database';
import type { RowDataPacket } from 'mysql2';
import type { ProductImageRecord } from '../models/product.model';
import type { ListQuery, ProductStatus } from '../types';

/** Merge the shared list params with this resource's own query-string filters. */
function productFilters(req: Request): ProductFiltersInput {
  const list = parseListQuery(req);
  const q = req.query as Record<string, string | undefined>;
  const flag = (key: string): boolean | undefined =>
    q[key] === undefined ? undefined : q[key] === 'true' || q[key] === '1';
  const num = (key: string): number | undefined =>
    q[key] === undefined || q[key] === '' ? undefined : Number(q[key]);

  return {
    ...list,
    categoryId: num('category_id'),
    brandId: num('brand_id'),
    status: (q.status as ProductStatus | undefined) || undefined,
    featured: flag('featured'),
    minPrice: num('min_price'),
    maxPrice: num('max_price'),
    lowStock: flag('low_stock'),
    outOfStock: flag('out_of_stock'),
  };
}

export const listProductsHandler = asyncHandler(async (req: Request, res: Response) => {
  return paginated(res, await getProducts(productFilters(req)));
});

export const productStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await getProductStats());
});

export const productFormOptionsHandler = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await getFormOptions());
});

export const getProductHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getProduct(Number(req.params.id)));
});

export const createProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const product = await createNewProduct(req.body, req.user!.id);
  return created(res, { id: product.id }, 'Product created successfully');
});

export const updateProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const product = await updateNewProduct(Number(req.params.id), req.body);
  return ok(res, product, 'Product updated successfully');
});

export const deleteProductHandler = asyncHandler(async (req: Request, res: Response) => {
  await removeProduct(Number(req.params.id), req.user!.id);
  return noContent(res);
});

// ------------------------------------------------------------------ images
export const listImagesHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getProductImages(Number(req.params.id)));
});

export const addImageHandler = asyncHandler(async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const body = req.body as Record<string, unknown>;

  // The form may upload several files at once, or submit an already-stored path.
  // Multer has already written each file into its destination folder (default
  // `files`), so the stored public path must include that folder — otherwise the
  // browser resolves it relative to the uploads root and gets a 404.
  const paths = files.length
    ? files.map((file) => toPublicPath(path.basename(file.destination), file.filename))
    : body.image
      ? [String(body.image)]
      : [];

  if (paths.length === 0) throw ApiError.badRequest('No image was supplied');

  const isPrimary = body?.is_primary === true || body?.is_primary === 'true' || body?.is_primary === '1' || body?.is_primary === 1;
  let images: ProductImageRecord[] = [];
  for (const [index, image] of paths.entries()) {
    const result = await addImage(productId, {
      image,
      // Only the first upload can claim primary when several arrive at once.
      is_primary: isPrimary && index === 0,
      sort_order: index,
    });
    images = result.images;
  }
  return created(res, images, 'Image added');
});

export const deleteImageHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await removeImage(Number(req.params.id), Number(req.params.imageId)));
});

export const primaryImageHandler = asyncHandler(async (req: Request, res: Response) => {
  const images = await makePrimaryImage(Number(req.params.id), Number(req.params.imageId));
  return ok(res, images, 'Primary image updated');
});

// --------------------------------------------------------- specifications
export const listSpecificationsHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getSpecifications(Number(req.params.id)));
});

export const saveSpecificationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const specs = (req.body?.specifications ?? []) as Array<{
    attribute_name: string;
    attribute_value: string;
  }>;
  return ok(
    res,
    await saveSpecifications(Number(req.params.id), specs),
    'Specifications saved'
  );
});

// -------------------------------------------------------------- inventory
export const stockHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await adjustProductStock(Number(req.params.id), req.body, req.user!.id);
  return ok(res, result, 'Stock updated');
});

export const inventoryLogsHandler = asyncHandler(async (req: Request, res: Response) => {
  return paginated(res, await getInventoryLogs(parseListQuery(req)));
});

export const exportProductsHandler = asyncHandler(async (req: Request, res: Response) => {
  const format = req.query.format === 'json' ? 'json' : 'csv';
  const file = await exportProducts(productFilters(req), format);
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  return res.send(file.body);
});

// -------------------------------------------------------------- storefront
/** `1,4,9` -> `[1, 4, 9]`, ignoring blanks and non-numeric entries. */
function idList(value: string | undefined): number[] | undefined {
  if (!value) return undefined;
  const ids = value
    .split(',')
    .map((entry) => Number(entry.trim()))
    .filter((entry) => Number.isInteger(entry) && entry > 0);
  return ids.length ? ids : undefined;
}

/** The storefront's query-string filters, shared by the grid and the facets. */
function storefrontFilters(req: Request): ProductFiltersInput {
  const list = parseListQuery(req);
  const q = req.query as Record<string, string | undefined>;
  const num = (key: string): number | undefined =>
    q[key] === undefined || q[key] === '' ? undefined : Number(q[key]);
  // Must stay `undefined` when the parameter is absent: passing `false` would
  // mean "hide unfeatured products" and silently shrink the catalogue.
  const flag = (key: string): boolean | undefined =>
    q[key] === undefined ? undefined : q[key] === 'true' || q[key] === '1';

  return {
    ...list,
    categoryId: num('category_id'),
    categoryIds: idList(q.category_ids),
    brandId: num('brand_id'),
    brandIds: idList(q.brand_ids),
    minPrice: num('min_price'),
    maxPrice: num('max_price'),
    minRating: num('min_rating'),
    onSale: flag('on_sale'),
    inStock: flag('in_stock'),
    featured: flag('featured'),
  };
}

/** Public catalogue feed: active products only, decorated with wishlist state. */
export const browseHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await browseProducts(storefrontFilters(req), req.user?.id ?? null);
  return paginated(res, result);
});

/** Price bounds for the sidebar slider — same filters as the grid. */
export const browseFacetsHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await browseFacets(storefrontFilters(req)));
});

/** Storefront detail page, addressed by slug, with reviews and related items. */
export const browseDetailHandler = asyncHandler(async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const base: ListQuery = {
    page: 1,
    pageSize: 1,
    search: '',
    sortBy: 'id',
    sortDir: 'desc',
    filters: {},
  };

  // Look the product up by slug directly so a name search cannot match it.
  const row = await queryOne<RowDataPacket & { id: number }>(
    `SELECT id FROM products WHERE slug = ? AND status = 'active' LIMIT 1`,
    [slug]
  );
  if (!row) throw ApiError.notFound('Product not found');

  const productId = Number(row.id);
  const detail = await getProduct(productId);
  const [reviews, related] = await Promise.all([
    getProductReviews(productId, 1, 20),
    browseProducts({ ...base, pageSize: 5, categoryId: detail.category_id }, req.user?.id ?? null),
  ]);

  return ok(res, {
    ...detail,
    // The grid feed derives this flag in `browseProducts`; the detail record is
    // the raw row, so it has to be derived here too or the page misses the sale.
    on_sale: detail.sale_price !== null,
    in_wishlist: false,
    reviews: reviews.data,
    review_meta: reviews.meta,
    related: related.data.filter((item) => item.id !== productId).slice(0, 4),
  });
});
