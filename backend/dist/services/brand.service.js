"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrands = getBrands;
exports.getAllBrands = getAllBrands;
exports.getBrand = getBrand;
exports.createNewBrand = createNewBrand;
exports.updateExistingBrand = updateExistingBrand;
exports.removeBrand = removeBrand;
exports.forceRemoveBrand = forceRemoveBrand;
exports.exportBrands = exportBrands;
const ApiError_1 = require("../utils/ApiError");
const sanitize_1 = require("../utils/sanitize");
const csv_1 = require("../utils/csv");
const brand_model_1 = require("../models/brand.model");
const category_model_1 = require("../models/category.model");
const upload_1 = require("../middleware/upload");
async function uniqueSlug(base, excludeId) {
    let slug = base;
    let suffix = 1;
    while (await (0, category_model_1.slugExists)('brands', slug, excludeId)) {
        suffix += 1;
        slug = `${base}-${suffix}`;
        if (suffix > 200)
            return `${base}-${Date.now()}`;
    }
    return slug;
}
async function getBrands(list) {
    return (0, brand_model_1.listBrands)(list);
}
async function getAllBrands() {
    return (0, brand_model_1.listAllBrands)();
}
async function getBrand(id) {
    const brand = await (0, brand_model_1.findBrandById)(id);
    if (!brand)
        throw ApiError_1.ApiError.notFound('Brand not found');
    return brand;
}
async function createNewBrand(data) {
    const name = String(data.name);
    const id = await (0, brand_model_1.createBrand)({
        name,
        slug: await uniqueSlug(String(data.slug || (0, sanitize_1.slugify)(name))),
        logo: data.logo ?? null,
        description: data.description ?? null,
        status: data.status ?? 'active',
    });
    return (0, brand_model_1.findBrandById)(id);
}
async function updateExistingBrand(id, data) {
    const existing = await (0, brand_model_1.findBrandById)(id);
    if (!existing)
        throw ApiError_1.ApiError.notFound('Brand not found');
    const patch = {};
    if (data.name !== undefined)
        patch.name = String(data.name);
    if (data.slug !== undefined)
        patch.slug = await uniqueSlug(String(data.slug), id);
    if (data.logo !== undefined)
        patch.logo = String(data.logo);
    if (data.description !== undefined)
        patch.description = String(data.description);
    if (data.status !== undefined)
        patch.status = data.status;
    await (0, brand_model_1.updateBrand)(id, patch);
    return (0, brand_model_1.findBrandById)(id);
}
async function removeBrand(id) {
    const existing = await (0, brand_model_1.findBrandById)(id);
    if (!existing)
        throw ApiError_1.ApiError.notFound('Brand not found');
    const products = await (0, brand_model_1.countBrandProducts)(id);
    if (products > 0) {
        // brands.product_id is ON DELETE SET NULL, so this is safe, but warn the
        // user because those products would become brand-less.
        throw ApiError_1.ApiError.badRequest(`${products} product${products === 1 ? '' : 's'} still use this brand. Reassign them first, or delete the brand and the products will become brand-less.`, { product_count: products, allow_force: true });
    }
    await (0, brand_model_1.deleteBrand)(id);
    if (existing.logo)
        (0, upload_1.removeUploadedFile)(existing.logo);
    return true;
}
/** Explicit opt-in for the force-delete path described in `removeBrand`. */
async function forceRemoveBrand(id) {
    const existing = await (0, brand_model_1.findBrandById)(id);
    if (!existing)
        throw ApiError_1.ApiError.notFound('Brand not found');
    await (0, brand_model_1.deleteBrand)(id);
    if (existing.logo)
        (0, upload_1.removeUploadedFile)(existing.logo);
    return true;
}
async function exportBrands(list, format) {
    const result = await (0, brand_model_1.listBrands)({ ...list, page: 1, pageSize: 10000 });
    if (format === 'json') {
        return {
            body: JSON.stringify(result.data, null, 2),
            mimeType: 'application/json',
            filename: `brands-export-${Date.now()}.json`,
        };
    }
    const csv = (0, csv_1.toCsv)(result.data, [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Name' },
        { key: 'slug', header: 'Slug' },
        { key: 'product_count', header: 'Products' },
        { key: 'status', header: 'Status' },
        { key: 'created_at', header: 'Created At' },
    ]);
    return { body: csv, mimeType: 'text/csv; charset=utf-8', filename: `brands-export-${Date.now()}.csv` };
}
//# sourceMappingURL=brand.service.js.map