"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCategoriesHandler = exports.deleteCategoryHandler = exports.updateCategoryHandler = exports.createCategoryHandler = exports.getCategoryHandler = exports.categoryTreeHandler = exports.listCategoriesHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const pagination_1 = require("../utils/pagination");
const category_service_1 = require("../services/category.service");
exports.listCategoriesHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.paginated)(res, await (0, category_service_1.getCategories)((0, pagination_1.parseListQuery)(req)));
});
exports.categoryTreeHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, category_service_1.getCategoryTree)());
});
exports.getCategoryHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, category_service_1.getCategory)(Number(req.params.id)));
});
exports.createCategoryHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const record = await (0, category_service_1.createNewCategory)(req.body);
    return (0, ApiResponse_1.created)(res, { id: record.id }, 'Category created successfully');
});
exports.updateCategoryHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = await (0, category_service_1.updateExistingCategory)(Number(req.params.id), req.body);
    return (0, ApiResponse_1.ok)(res, category, 'Category updated successfully');
});
exports.deleteCategoryHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, category_service_1.removeCategory)(Number(req.params.id));
    return (0, ApiResponse_1.noContent)(res);
});
exports.exportCategoriesHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const format = req.query.format === 'json' ? 'json' : 'csv';
    const file = await (0, category_service_1.exportCategories)((0, pagination_1.parseListQuery)(req), format);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    return res.send(file.body);
});
//# sourceMappingURL=category.controller.js.map