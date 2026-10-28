"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const file_service_1 = require("../services/file.service");
/**
 * Generic single-image endpoint used by the product, category, brand, user and
 * review forms. It returns the stored row so the client can immediately set the
 * hidden input to the returned `/uploads/...` path.
 */
exports.uploadImageHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stored = await (0, file_service_1.storeUpload)(req.file, 'image', req.user?.id ?? null);
    return (0, ApiResponse_1.created)(res, stored, 'Image uploaded');
});
//# sourceMappingURL=upload.controller.js.map