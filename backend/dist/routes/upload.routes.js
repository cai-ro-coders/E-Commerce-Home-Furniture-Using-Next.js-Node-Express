"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const upload_controller_1 = require("../controllers/upload.controller");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
/**
 * Single-image upload shared by the product, category, brand, user and review
 * forms. Returns the stored file record, whose `path` is what the form saves.
 */
router.post('/image', auth_1.authenticate, upload_1.uploadSingleImage, upload_controller_1.uploadImageHandler);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map