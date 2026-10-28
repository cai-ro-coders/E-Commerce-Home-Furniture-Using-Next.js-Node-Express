"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const file_controller_1 = require("../controllers/file.controller");
const upload_controller_1 = require("../controllers/upload.controller");
const order_validator_1 = require("../validators/order.validator");
const common_validator_1 = require("../validators/common.validator");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// The File Manager is admin-only, including the generic upload endpoint that
// the product, category, brand and profile forms all post to.
router.use(auth_1.authenticate, rbac_1.requireAdmin);
router.get('/', (0, asyncHandler_1.validate)(order_validator_1.fileListQuerySchema, 'query'), file_controller_1.listFilesHandler);
router.get('/stats', file_controller_1.fileStatsHandler);
router.get('/backups', file_controller_1.listBackupsHandler);
router.post('/backups', file_controller_1.backupHandler);
router.get('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), file_controller_1.getFileHandler);
router.post('/upload', upload_1.uploadAny, file_controller_1.uploadFilesHandler);
router.post('/upload-single', upload_1.upload.single('file'), file_controller_1.uploadSingleHandler);
/** One-image upload used by the inline "Change photo" pickers. */
router.post('/upload-image', upload_1.upload.single('image'), upload_controller_1.uploadImageHandler);
router.patch('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), file_controller_1.moveFileHandler);
router.delete('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), file_controller_1.deleteFileHandler);
exports.default = router;
//# sourceMappingURL=file.routes.js.map