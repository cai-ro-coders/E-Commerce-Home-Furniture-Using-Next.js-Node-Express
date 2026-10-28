"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.browseDetailHandler = exports.browseFacetsHandler = exports.browseHandler = exports.exportProductsHandler = exports.inventoryLogsHandler = exports.stockHandler = exports.saveSpecificationsHandler = exports.listSpecificationsHandler = exports.primaryImageHandler = exports.deleteImageHandler = exports.addImageHandler = exports.listImagesHandler = exports.deleteProductHandler = exports.updateProductHandler = exports.createProductHandler = exports.getProductHandler = exports.productFormOptionsHandler = exports.productStatsHandler = exports.listProductsHandler = void 0;
const path_1 = __importDefault(require("path"));
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const pagination_1 = require("../utils/pagination");
const ApiError_1 = require("../utils/ApiError");
const product_service_1 = require("../services/product.service");
const review_service_1 = require("../services/review.service");
const upload_1 = require("../middleware/upload");
const database_1 = require("../config/database");
/** Merge the shared list params with this resource's own query-string filters. */
function productFilters(req) {
    const list = (0, pagination_1.parseListQuery)(req);
    const q = req.query;
    const flag = (key) => q[key] === undefined ? undefined : q[key] === 'true' || q[key] === '1';
    const num = (key) => q[key] === undefined || q[key] === '' ? undefined : Number(q[key]);
    return {
        ...list,
        categoryId: num('category_id'),
        brandId: num('brand_id'),
        status: q.status || undefined,
        featured: flag('featured'),
        minPrice: num('min_price'),
        maxPrice: num('max_price'),
        lowStock: flag('low_stock'),
        outOfStock: flag('out_of_stock'),
    };
}
exports.listProductsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.paginated)(res, await (0, product_service_1.getProducts)(productFilters(req)));
});
exports.productStatsHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, product_service_1.getProductStats)());
});
exports.productFormOptionsHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, product_service_1.getFormOptions)());
});
exports.getProductHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, product_service_1.getProduct)(Number(req.params.id)));
});
exports.createProductHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await (0, product_service_1.createNewProduct)(req.body, req.user.id);
    return (0, ApiResponse_1.created)(res, { id: product.id }, 'Product created successfully');
});
exports.updateProductHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await (0, product_service_1.updateNewProduct)(Number(req.params.id), req.body);
    return (0, ApiResponse_1.ok)(res, product, 'Product updated successfully');
});
exports.deleteProductHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, product_service_1.removeProduct)(Number(req.params.id), req.user.id);
    return (0, ApiResponse_1.noContent)(res);
});
// ------------------------------------------------------------------ images
exports.listImagesHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, product_service_1.getProductImages)(Number(req.params.id)));
});
exports.addImageHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const productId = Number(req.params.id);
    const files = req.files ?? [];
    const body = req.body;
    // The form may upload several files at once, or submit an already-stored path.
    // Multer has already written each file into its destination folder (default
    // `files`), so the stored public path must include that folder — otherwise the
    // browser resolves it relative to the uploads root and gets a 404.
    const paths = files.length
        ? files.map((file) => (0, upload_1.toPublicPath)(path_1.default.basename(file.destination), file.filename))
        : body.image
            ? [String(body.image)]
            : [];
    if (paths.length === 0)
        throw ApiError_1.ApiError.badRequest('No image was supplied');
    const isPrimary = body?.is_primary === true || body?.is_primary === 'true' || body?.is_primary === '1' || body?.is_primary === 1;
    let images = [];
    for (const [index, image] of paths.entries()) {
        const result = await (0, product_service_1.addImage)(productId, {
            image,
            // Only the first upload can claim primary when several arrive at once.
            is_primary: isPrimary && index === 0,
            sort_order: index,
        });
        images = result.images;
    }
    return (0, ApiResponse_1.created)(res, images, 'Image added');
});
exports.deleteImageHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, product_service_1.removeImage)(Number(req.params.id), Number(req.params.imageId)));
});
exports.primaryImageHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const images = await (0, product_service_1.makePrimaryImage)(Number(req.params.id), Number(req.params.imageId));
    return (0, ApiResponse_1.ok)(res, images, 'Primary image updated');
});
// --------------------------------------------------------- specifications
exports.listSpecificationsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, product_service_1.getSpecifications)(Number(req.params.id)));
});
exports.saveSpecificationsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const specs = (req.body?.specifications ?? []);
    return (0, ApiResponse_1.ok)(res, await (0, product_service_1.saveSpecifications)(Number(req.params.id), specs), 'Specifications saved');
});
// -------------------------------------------------------------- inventory
exports.stockHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, product_service_1.adjustProductStock)(Number(req.params.id), req.body, req.user.id);
    return (0, ApiResponse_1.ok)(res, result, 'Stock updated');
});
exports.inventoryLogsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.paginated)(res, await (0, product_service_1.getInventoryLogs)((0, pagination_1.parseListQuery)(req)));
});
exports.exportProductsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const format = req.query.format === 'json' ? 'json' : 'csv';
    const file = await (0, product_service_1.exportProducts)(productFilters(req), format);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    return res.send(file.body);
});
// -------------------------------------------------------------- storefront
/** `1,4,9` -> `[1, 4, 9]`, ignoring blanks and non-numeric entries. */
function idList(value) {
    if (!value)
        return undefined;
    const ids = value
        .split(',')
        .map((entry) => Number(entry.trim()))
        .filter((entry) => Number.isInteger(entry) && entry > 0);
    return ids.length ? ids : undefined;
}
/** The storefront's query-string filters, shared by the grid and the facets. */
function storefrontFilters(req) {
    const list = (0, pagination_1.parseListQuery)(req);
    const q = req.query;
    const num = (key) => q[key] === undefined || q[key] === '' ? undefined : Number(q[key]);
    // Must stay `undefined` when the parameter is absent: passing `false` would
    // mean "hide unfeatured products" and silently shrink the catalogue.
    const flag = (key) => q[key] === undefined ? undefined : q[key] === 'true' || q[key] === '1';
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
exports.browseHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, product_service_1.browseProducts)(storefrontFilters(req), req.user?.id ?? null);
    return (0, ApiResponse_1.paginated)(res, result);
});
/** Price bounds for the sidebar slider — same filters as the grid. */
exports.browseFacetsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, product_service_1.browseFacets)(storefrontFilters(req)));
});
/** Storefront detail page, addressed by slug, with reviews and related items. */
exports.browseDetailHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const slug = String(req.params.slug);
    const base = {
        page: 1,
        pageSize: 1,
        search: '',
        sortBy: 'id',
        sortDir: 'desc',
        filters: {},
    };
    // Look the product up by slug directly so a name search cannot match it.
    const row = await (0, database_1.queryOne)(`SELECT id FROM products WHERE slug = ? AND status = 'active' LIMIT 1`, [slug]);
    if (!row)
        throw ApiError_1.ApiError.notFound('Product not found');
    const productId = Number(row.id);
    const detail = await (0, product_service_1.getProduct)(productId);
    const [reviews, related] = await Promise.all([
        (0, review_service_1.getProductReviews)(productId, 1, 20),
        (0, product_service_1.browseProducts)({ ...base, pageSize: 5, categoryId: detail.category_id }, req.user?.id ?? null),
    ]);
    return (0, ApiResponse_1.ok)(res, {
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
//# sourceMappingURL=product.controller.js.map