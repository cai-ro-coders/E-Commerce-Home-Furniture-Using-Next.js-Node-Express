"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const setting_controller_1 = require("../controllers/setting.controller");
const catalog_validator_1 = require("../validators/catalog.validator");
const common_validator_1 = require("../validators/common.validator");
const asyncHandler_2 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const setting_model_1 = require("../models/setting.model");
const router = (0, express_1.Router)();
/** Public, and deliberately narrow: the storefront needs these to render. */
router.get('/public', auth_1.optionalAuth, setting_controller_1.publicSettingsHandler);
router.get('/public/all', auth_1.optionalAuth, (0, asyncHandler_2.asyncHandler)(async (_req, res) => {
    const all = await (0, setting_model_1.settingsMap)();
    const allow = [
        'site_name',
        'site_logo',
        'site_description',
        'currency',
        'tax_rate',
        'shipping_fee',
        'support_email',
        'support_phone',
        'address',
    ];
    return (0, ApiResponse_1.ok)(res, Object.fromEntries(allow.map((key) => [key, all[key] ?? ''])));
}));
router.use(auth_1.authenticate, rbac_1.requireAdmin);
router.get('/', (0, asyncHandler_1.validate)(catalog_validator_1.settingListQuerySchema, 'query'), setting_controller_1.listSettingsHandler);
router.get('/grouped', setting_controller_1.groupedSettingsHandler);
router.get('/export', setting_controller_1.exportSettingsHandler);
router.get('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), setting_controller_1.getSettingHandler);
router.post('/', (0, asyncHandler_1.validate)(common_validator_1.upsertSettingSchema), setting_controller_1.createSettingHandler);
router.put('/bulk', setting_controller_1.bulkUpdateSettingsHandler);
router.put('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), setting_controller_1.updateSettingHandler);
router.delete('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), setting_controller_1.deleteSettingHandler);
exports.default = router;
//# sourceMappingURL=setting.routes.js.map