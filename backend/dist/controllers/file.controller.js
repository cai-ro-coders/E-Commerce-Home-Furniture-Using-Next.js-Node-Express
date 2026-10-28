"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBackupsHandler = exports.backupHandler = exports.deleteFileHandler = exports.moveFileHandler = exports.uploadSingleHandler = exports.uploadFilesHandler = exports.getFileHandler = exports.fileStatsHandler = exports.listFilesHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const pagination_1 = require("../utils/pagination");
const ApiError_1 = require("../utils/ApiError");
const file_service_1 = require("../services/file.service");
function pickCategory(value) {
    const allowed = ['image', 'document', 'contract', 'invoice', 'customer', 'other'];
    const found = allowed.find((item) => item === value);
    return found;
}
exports.listFilesHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.paginated)(res, await (0, file_service_1.getFiles)((0, pagination_1.parseListQuery)(req)));
});
exports.fileStatsHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, file_service_1.getFileStats)());
});
exports.getFileHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, file_service_1.getFile)(Number(req.params.id)));
});
exports.uploadFilesHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const files = req.files ?? [];
    const single = req.file;
    if (files.length === 0 && !single)
        throw ApiError_1.ApiError.badRequest('No file was uploaded');
    const category = pickCategory(req.body?.category) ?? 'other';
    const stored = await (0, file_service_1.storeUploads)(files.length ? files : [single], category, req.user.id);
    return (0, ApiResponse_1.created)(res, stored, 'Upload complete');
});
exports.uploadSingleHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = pickCategory(req.body?.category) ?? 'image';
    const stored = await (0, file_service_1.storeUpload)(req.file, category, req.user.id);
    return (0, ApiResponse_1.created)(res, stored, 'Upload complete');
});
exports.moveFileHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = pickCategory(req.body.category);
    if (!category)
        throw ApiError_1.ApiError.badRequest('Unknown file category');
    return (0, ApiResponse_1.ok)(res, await (0, file_service_1.changeCategory)(Number(req.params.id), category), 'File moved');
});
exports.deleteFileHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, file_service_1.removeStoredFile)(Number(req.params.id));
    return (0, ApiResponse_1.noContent)(res);
});
exports.backupHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    return (0, ApiResponse_1.created)(res, await (0, file_service_1.createBackup)(), 'Database backup created');
});
exports.listBackupsHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    return (0, ApiResponse_1.ok)(res, (0, file_service_1.listBackups)());
});
//# sourceMappingURL=file.controller.js.map