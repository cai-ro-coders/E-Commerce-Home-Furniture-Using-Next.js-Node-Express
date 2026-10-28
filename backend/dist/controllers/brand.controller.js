"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportBrandsHandler = exports.forceDeleteBrandHandler = exports.deleteBrandHandler = exports.updateBrandHandler = exports.createBrandHandler = exports.getBrandHandler = exports.allBrandsHandler = exports.listBrandsHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const pagination_1 = require("../utils/pagination");
const brand_service_1 = require("../services/brand.service");
exports.listBrandsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.paginated)(res, await (0, brand_service_1.getBrands)((0, pagination_1.parseListQuery)(req)));
});
exports.allBrandsHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, brand_service_1.getAllBrands)());
});
exports.getBrandHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, brand_service_1.getBrand)(Number(req.params.id)));
});
exports.createBrandHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const record = await (0, brand_service_1.createNewBrand)(req.body);
    return (0, ApiResponse_1.created)(res, { id: record.id }, 'Brand created successfully');
});
exports.updateBrandHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const brand = await (0, brand_service_1.updateExistingBrand)(Number(req.params.id), req.body);
    return (0, ApiResponse_1.ok)(res, brand, 'Brand updated successfully');
});
exports.deleteBrandHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, brand_service_1.removeBrand)(Number(req.params.id));
    return (0, ApiResponse_1.noContent)(res);
});
/** Last resort when a brand still has products attached after reassignment. */
exports.forceDeleteBrandHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, brand_service_1.forceRemoveBrand)(Number(req.params.id));
    return (0, ApiResponse_1.noContent)(res);
});
exports.exportBrandsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const format = req.query.format === 'json' ? 'json' : 'csv';
    const file = await (0, brand_service_1.exportBrands)((0, pagination_1.parseListQuery)(req), format);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    return res.send(file.body);
});
//# sourceMappingURL=brand.controller.js.map