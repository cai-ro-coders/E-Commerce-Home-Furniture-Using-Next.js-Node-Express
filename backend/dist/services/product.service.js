"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = getProducts;
exports.getProduct = getProduct;
exports.createNewProduct = createNewProduct;
exports.updateNewProduct = updateNewProduct;
exports.removeProduct = removeProduct;
exports.getProductImages = getProductImages;
exports.addImage = addImage;
exports.removeImage = removeImage;
exports.makePrimaryImage = makePrimaryImage;
exports.getSpecifications = getSpecifications;
exports.saveSpecifications = saveSpecifications;
exports.adjustProductStock = adjustProductStock;
exports.getInventoryLogs = getInventoryLogs;
exports.getProductStats = getProductStats;
exports.exportProducts = exportProducts;
exports.getFormOptions = getFormOptions;
exports.browseFacets = browseFacets;
exports.browseProducts = browseProducts;
const database_1 = require("../config/database");
const ApiError_1 = require("../utils/ApiError");
const sanitize_1 = require("../utils/sanitize");
const csv_1 = require("../utils/csv");
const upload_1 = require("../middleware/upload");
const product_model_1 = require("../models/product.model");
const category_model_1 = require("../models/category.model");
const brand_model_1 = require("../models/brand.model");
/** Ensure a slug is unique by appending -2, -3, ... when needed. */
async function uniqueSlug(base, excludeId) {
    let slug = base;
    let suffix = 1;
    // Bounded loop: guarantees termination even on pathological data.
    while (await (0, product_model_1.slugExists)(slug, excludeId)) {
        suffix += 1;
        slug = `${base}-${suffix}`;
        if (suffix > 200) {
            slug = `${base}-${Date.now()}`;
            break;
        }
    }
    return slug;
}
async function uniqueSku(base, name, excludeId) {
    // Derive a readable SKU from the product name when one is not supplied.
    const candidate = (base?.trim() || name)
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40);
    const seed = candidate || 'PROD';
    let sku = seed;
    let suffix = 1;
    while (await (0, product_model_1.skuExists)(sku, excludeId)) {
        suffix += 1;
        sku = `${seed}-${suffix}`;
        if (suffix > 9999) {
            sku = `${seed}-${Date.now()}`;
            break;
        }
    }
    return sku;
}
async function assertCategoryExists(categoryId) {
    const row = await (0, database_1.queryOne)('SELECT id FROM categories WHERE id = ? LIMIT 1', [
        categoryId,
    ]);
    if (!row)
        throw ApiError_1.ApiError.badRequest('The selected category does not exist');
}
async function assertBrandExists(brandId) {
    const row = await (0, database_1.queryOne)('SELECT id FROM brands WHERE id = ? LIMIT 1', [brandId]);
    if (!row)
        throw ApiError_1.ApiError.badRequest('The selected brand does not exist');
}
async function getProducts(filters) {
    return (0, product_model_1.listProducts)(filters);
}
async function getProduct(id) {
    const product = await (0, product_model_1.findProductById)(id);
    if (!product)
        throw ApiError_1.ApiError.notFound('Product not found');
    const [images, specifications, inventory] = await Promise.all([
        (0, product_model_1.listProductImages)(id),
        (0, product_model_1.listSpecifications)(id),
        (0, product_model_1.listInventoryLogs)({ page: 1, pageSize: 20, search: '', sortBy: 'id', sortDir: 'desc', filters: { productId: String(id) } }),
    ]);
    return { ...product, images, specifications, inventory: inventory.data };
}
async function createNewProduct(data, actorId) {
    const categoryId = Number(data.category_id);
    await assertCategoryExists(categoryId);
    if (data.brand_id)
        await assertBrandExists(Number(data.brand_id));
    const name = String(data.name);
    const slug = await uniqueSlug(String(data.slug || (0, sanitize_1.slugify)(name)));
    const sku = await uniqueSku(data.sku, name);
    const id = await (0, product_model_1.createProduct)({
        category_id: categoryId,
        brand_id: data.brand_id ? Number(data.brand_id) : null,
        sku,
        name,
        slug,
        short_description: data.short_description ?? null,
        description: data.description ?? null,
        price: Number(data.price),
        sale_price: data.sale_price === undefined || data.sale_price === null ? null : Number(data.sale_price),
        cost_price: data.cost_price === undefined || data.cost_price === null ? null : Number(data.cost_price),
        weight: data.weight === undefined || data.weight === null ? null : Number(data.weight),
        dimensions: data.dimensions ?? null,
        stock_quantity: Number(data.stock_quantity ?? 0),
        minimum_stock: Number(data.minimum_stock ?? 5),
        featured: data.featured ? 1 : 0,
        status: data.status ?? 'active',
    });
    // The single `image` field from the form becomes the primary product image.
    if (data.image) {
        await (0, product_model_1.addProductImage)({ product_id: id, image: String(data.image), is_primary: true, sort_order: 0 });
    }
    if (Number(data.stock_quantity ?? 0) > 0) {
        await (0, product_model_1.adjustStock)({
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
async function updateNewProduct(id, data) {
    const existing = await (0, product_model_1.findProductById)(id);
    if (!existing)
        throw ApiError_1.ApiError.notFound('Product not found');
    const patch = {};
    if (data.name !== undefined)
        patch.name = data.name;
    if (data.category_id !== undefined) {
        await assertCategoryExists(Number(data.category_id));
        patch.category_id = Number(data.category_id);
    }
    if (data.brand_id !== undefined) {
        if (data.brand_id)
            await assertBrandExists(Number(data.brand_id));
        patch.brand_id = data.brand_id ? Number(data.brand_id) : null;
    }
    if (data.slug !== undefined)
        patch.slug = await uniqueSlug(String(data.slug), id);
    if (data.short_description !== undefined)
        patch.short_description = data.short_description;
    if (data.description !== undefined)
        patch.description = data.description;
    if (data.price !== undefined)
        patch.price = Number(data.price);
    if (data.sale_price !== undefined) {
        patch.sale_price = data.sale_price === null || data.sale_price === '' ? null : Number(data.sale_price);
    }
    if (data.cost_price !== undefined) {
        patch.cost_price = data.cost_price === null || data.cost_price === '' ? null : Number(data.cost_price);
    }
    if (data.weight !== undefined)
        patch.weight = data.weight === null ? null : Number(data.weight);
    if (data.dimensions !== undefined)
        patch.dimensions = data.dimensions;
    if (data.minimum_stock !== undefined)
        patch.minimum_stock = Number(data.minimum_stock);
    if (data.featured !== undefined)
        patch.featured = data.featured;
    if (data.status !== undefined)
        patch.status = data.status;
    // Re-validate the sale price against the *effective* price after the merge,
    // otherwise lowering `price` below an existing `sale_price` would violate the
    // table's CHECK constraint with a confusing 500.
    const effectivePrice = patch.price !== undefined ? Number(patch.price) : Number(existing.price);
    const effectiveSale = 'sale_price' in patch
        ? patch.sale_price
        : (existing.sale_price === null ? null : Number(existing.sale_price));
    if (effectiveSale !== null && effectiveSale >= effectivePrice) {
        throw ApiError_1.ApiError.badRequest('Sale price must be lower than the regular price');
    }
    await (0, product_model_1.updateProduct)(id, patch);
    if (data.image) {
        const images = await (0, product_model_1.listProductImages)(id);
        if (images.length === 0) {
            await (0, product_model_1.addProductImage)({ product_id: id, image: String(data.image), is_primary: true, sort_order: 0 });
        }
    }
    return getProduct(id);
}
async function removeProduct(id, actorId) {
    const images = await (0, product_model_1.listProductImages)(id);
    const deleted = await (0, product_model_1.deleteProduct)(id, actorId);
    if (deleted) {
        // Clean up orphaned files on disk after the rows are gone.
        for (const image of images)
            (0, upload_1.removeUploadedFile)(image.image);
    }
    return deleted;
}
// ------------------------------------------------------------------ images
async function getProductImages(productId) {
    const product = await (0, product_model_1.findProductById)(productId);
    if (!product)
        throw ApiError_1.ApiError.notFound('Product not found');
    return (0, product_model_1.listProductImages)(productId);
}
async function addImage(productId, data) {
    const product = await (0, product_model_1.findProductById)(productId);
    if (!product)
        throw ApiError_1.ApiError.notFound('Product not found');
    const id = await (0, product_model_1.addProductImage)({ product_id: productId, ...data });
    return { id, images: await (0, product_model_1.listProductImages)(productId) };
}
async function removeImage(productId, imageId) {
    const row = await (0, database_1.queryOne)('SELECT product_id FROM product_images WHERE id = ? LIMIT 1', [imageId]);
    if (!row || row.product_id !== productId)
        throw ApiError_1.ApiError.notFound('Image not found');
    const removed = await (0, product_model_1.deleteProductImage)(imageId);
    if (removed)
        (0, upload_1.removeUploadedFile)(removed.image);
    return (0, product_model_1.listProductImages)(productId);
}
async function makePrimaryImage(productId, imageId) {
    const done = await (0, product_model_1.setPrimaryImage)(productId, imageId);
    if (!done)
        throw ApiError_1.ApiError.notFound('Image not found');
    return (0, product_model_1.listProductImages)(productId);
}
// ---------------------------------------------------------- specifications
async function getSpecifications(productId) {
    return (0, product_model_1.listSpecifications)(productId);
}
async function saveSpecifications(productId, specs) {
    const product = await (0, product_model_1.findProductById)(productId);
    if (!product)
        throw ApiError_1.ApiError.notFound('Product not found');
    await (0, product_model_1.replaceSpecifications)(productId, specs);
    return (0, product_model_1.listSpecifications)(productId);
}
// -------------------------------------------------------------- inventory
async function adjustProductStock(productId, data, actorId) {
    try {
        const result = await (0, product_model_1.adjustStock)({ productId, ...data, userId: actorId });
        return result;
    }
    catch (error) {
        if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') {
            throw ApiError_1.ApiError.badRequest('Cannot reduce stock below zero');
        }
        if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
            throw ApiError_1.ApiError.notFound('Product not found');
        }
        throw error;
    }
}
async function getInventoryLogs(list) {
    return (0, product_model_1.listInventoryLogs)(list);
}
async function getProductStats() {
    return (0, product_model_1.productStats)();
}
// ------------------------------------------------------------------ export
async function exportProducts(filters, format) {
    // Reuse the same filter pipeline but pull a large single page.
    const result = await (0, product_model_1.listProducts)({
        ...filters,
        page: 1,
        pageSize: 10000,
    });
    if (format === 'json') {
        return {
            body: JSON.stringify(result.data.map((row) => ({
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
            })), null, 2),
            mimeType: 'application/json',
            filename: `products-export-${Date.now()}.json`,
        };
    }
    const csv = (0, csv_1.toCsv)(result.data, [
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
async function getFormOptions() {
    const [categories, brands] = await Promise.all([(0, category_model_1.categoryTree)(), (0, brand_model_1.listAllBrands)()]);
    return { categories, brands };
}
/** Price bounds for the storefront filter sidebar. */
async function browseFacets(filters) {
    return (0, product_model_1.productPriceRange)({ ...filters, status: 'active' });
}
/** Public storefront listing: active products only, with wishlist counts. */
async function browseProducts(filters, userId) {
    const result = await (0, product_model_1.listProducts)({
        ...filters,
        // The storefront must never leak a draft or archived listing, whatever the
        // caller passed, so `status` is forced rather than merged.
        status: 'active',
    });
    const productIds = result.data.map((row) => row.id);
    let wishlistMap = new Map();
    if (userId && productIds.length > 0) {
        const placeholders = productIds.map(() => '?').join(', ');
        const rows = await (0, database_1.query)(`SELECT product_id FROM wishlists WHERE user_id = ? AND product_id IN (${placeholders})`, [userId, ...productIds]);
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
//# sourceMappingURL=product.service.js.map