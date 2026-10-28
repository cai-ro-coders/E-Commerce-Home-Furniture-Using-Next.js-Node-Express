"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
exports.getGroupedSettings = getGroupedSettings;
exports.getPublicSettings = getPublicSettings;
exports.getSetting = getSetting;
exports.createNewSetting = createNewSetting;
exports.updateExistingSetting = updateExistingSetting;
exports.removeSetting = removeSetting;
exports.saveSettingUpdates = saveSettingUpdates;
exports.exportSettings = exportSettings;
const ApiError_1 = require("../utils/ApiError");
const csv_1 = require("../utils/csv");
const database_1 = require("../config/database");
const setting_model_1 = require("../models/setting.model");
async function getSettings(list) {
    return (0, setting_model_1.listSettings)(list);
}
async function getGroupedSettings() {
    const [grouped, groups] = await Promise.all([(0, setting_model_1.settingsByGroup)(), (0, setting_model_1.listGroups)()]);
    return { grouped, groups };
}
async function getPublicSettings() {
    const map = await (0, setting_model_1.settingsMap)();
    // Only expose settings that are safe for anonymous visitors.
    const safe = [
        'site_name',
        'site_logo',
        'support_email',
        'support_phone',
        'currency',
        'tax_rate',
        'shipping_fee',
        'address',
        'social_facebook',
        'social_instagram',
        'social_twitter',
    ];
    return Object.fromEntries(safe.map((key) => [key, map[key] ?? '']));
}
async function getSetting(id) {
    const setting = await (0, setting_model_1.findSettingById)(id);
    if (!setting)
        throw ApiError_1.ApiError.notFound('Setting not found');
    return setting;
}
async function createNewSetting(data) {
    const key = data.key.toLowerCase();
    if (await (0, setting_model_1.keyExists)(key))
        throw ApiError_1.ApiError.conflict('A setting with that key already exists');
    const id = await (0, setting_model_1.createSetting)({ key, group: data.group || 'general', value: data.value });
    return (0, setting_model_1.findSettingById)(id);
}
async function updateExistingSetting(id, data) {
    const existing = await (0, setting_model_1.findSettingById)(id);
    if (!existing)
        throw ApiError_1.ApiError.notFound('Setting not found');
    const patch = {};
    if (data.key !== undefined) {
        const key = data.key.toLowerCase();
        if (key !== existing.key && (await (0, setting_model_1.keyExists)(key, id))) {
            throw ApiError_1.ApiError.conflict('A setting with that key already exists');
        }
        patch.key = key;
    }
    if (data.group !== undefined)
        patch.group = data.group;
    if (data.value !== undefined)
        patch.value = data.value;
    await (0, setting_model_1.updateSetting)(id, patch);
    return (0, setting_model_1.findSettingById)(id);
}
async function removeSetting(id) {
    const existing = await (0, setting_model_1.findSettingById)(id);
    if (!existing)
        throw ApiError_1.ApiError.notFound('Setting not found');
    await (0, setting_model_1.deleteSetting)(id);
    return true;
}
/**
 * Save a batch of setting values, addressed either by `id` (the Settings CRUD
 * table) or by `key` (the grouped Settings forms).
 *
 * Every write is validated first so a bad key midway through cannot leave the
 * form half-saved. Unknown `id`s and unknown `key`s are reported instead of
 * being silently dropped.
 */
async function saveSettingUpdates(updates) {
    if (updates.length === 0)
        throw ApiError_1.ApiError.badRequest('No settings were supplied');
    const all = await (0, setting_model_1.settingsMap)();
    const byKey = new Map(Object.entries(all));
    // Resolve everything to a key up front.
    const resolved = [];
    for (const update of updates) {
        let key = update.key ? update.key.toLowerCase() : undefined;
        if (!key && update.id) {
            const record = await (0, setting_model_1.findSettingById)(Number(update.id));
            if (!record)
                throw ApiError_1.ApiError.notFound(`Setting ${update.id} not found`);
            key = record.key;
        }
        if (!key)
            throw ApiError_1.ApiError.badRequest('Each setting update needs an id or a key');
        if (!byKey.has(key))
            throw ApiError_1.ApiError.notFound(`Unknown setting "${key}"`);
        resolved.push({ key, value: update.value });
    }
    // Apply in one transaction so a failure rolls the whole form back.
    await (0, database_1.transaction)(async (connection) => {
        for (const { key, value } of resolved) {
            await connection.execute('UPDATE settings SET value = ? WHERE `key` = ?', [value, key]);
        }
    });
    return resolved.map((entry) => entry.key);
}
async function exportSettings(list, format) {
    const result = await (0, setting_model_1.listSettings)({ ...list, page: 1, pageSize: 10000 });
    if (format === 'json') {
        return {
            body: JSON.stringify(result.data, null, 2),
            mimeType: 'application/json',
            filename: `settings-export-${Date.now()}.json`,
        };
    }
    const csv = (0, csv_1.toCsv)(result.data, [
        { key: 'id', header: 'ID' },
        { key: 'key', header: 'Key' },
        { key: 'group', header: 'Group' },
        { key: 'value', header: 'Value' },
        { key: 'updated_at', header: 'Updated At' },
    ]);
    return { body: csv, mimeType: 'text/csv; charset=utf-8', filename: `settings-export-${Date.now()}.csv` };
}
//# sourceMappingURL=setting.service.js.map