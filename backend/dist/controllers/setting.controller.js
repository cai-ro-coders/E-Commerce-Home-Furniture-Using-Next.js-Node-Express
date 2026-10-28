"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportSettingsHandler = exports.deleteSettingHandler = exports.updateSettingHandler = exports.bulkUpdateSettingsHandler = exports.createSettingHandler = exports.getSettingHandler = exports.publicSettingsHandler = exports.groupedSettingsHandler = exports.listSettingsHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const pagination_1 = require("../utils/pagination");
const setting_service_1 = require("../services/setting.service");
exports.listSettingsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.paginated)(res, await (0, setting_service_1.getSettings)((0, pagination_1.parseListQuery)(req)));
});
exports.groupedSettingsHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, setting_service_1.getGroupedSettings)());
});
exports.publicSettingsHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, setting_service_1.getPublicSettings)());
});
exports.getSettingHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, setting_service_1.getSetting)(Number(req.params.id)));
});
exports.createSettingHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const record = await (0, setting_service_1.createNewSetting)(req.body);
    return (0, ApiResponse_1.created)(res, { id: record.id }, 'Setting saved');
});
/**
 * Bulk save from the admin Settings form.
 *
 * The settings page renders one group at a time and posts what changed, so it
 * sends the compact `{ key: value }` shape. The Settings CRUD table posts
 * explicit `[{ id, value }]` rows. Both are accepted here rather than forcing
 * the two screens to agree on a wire format they have no reason to share.
 */
exports.bulkUpdateSettingsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    // The grouped form posts the map itself (`{ stripe_secret_key: 'sk_…' }`),
    // while older/other callers wrap it in `{ settings: … }`. Accept both, plus
    // the CRUD table's explicit `[{ id, value }]` rows.
    const payload = (body && typeof body === 'object' && !Array.isArray(body) && 'settings' in body
        ? body.settings
        : body);
    const updates = Array.isArray(payload)
        ? payload.map((row) => ({ id: Number(row.id), key: row.key, value: String(row.value ?? '') }))
        : payload && typeof payload === 'object'
            ? Object.entries(payload).map(([key, value]) => ({ key, value: String(value ?? '') }))
            : [];
    const saved = await (0, setting_service_1.saveSettingUpdates)(updates);
    return (0, ApiResponse_1.ok)(res, { updated: saved.length, keys: saved }, 'Settings saved');
});
exports.updateSettingHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const setting = await (0, setting_service_1.updateExistingSetting)(Number(req.params.id), req.body);
    return (0, ApiResponse_1.ok)(res, setting, 'Setting updated');
});
exports.deleteSettingHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, setting_service_1.removeSetting)(Number(req.params.id));
    return (0, ApiResponse_1.noContent)(res);
});
exports.exportSettingsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const format = req.query.format === 'json' ? 'json' : 'csv';
    const file = await (0, setting_service_1.exportSettings)((0, pagination_1.parseListQuery)(req), format);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    return res.send(file.body);
});
//# sourceMappingURL=setting.controller.js.map