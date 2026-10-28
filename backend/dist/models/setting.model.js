"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSettings = listSettings;
exports.findSettingById = findSettingById;
exports.findSettingByKey = findSettingByKey;
exports.keyExists = keyExists;
exports.createSetting = createSetting;
exports.updateSetting = updateSetting;
exports.deleteSetting = deleteSetting;
exports.settingsMap = settingsMap;
exports.settingsByGroup = settingsByGroup;
exports.listGroups = listGroups;
const database_1 = require("../config/database");
const pagination_1 = require("../utils/pagination");
const SORTABLE = ['id', 'key', 'group', 'value', 'created_at', 'updated_at'];
async function listSettings(list) {
    const where = [];
    const params = [];
    const search = (0, pagination_1.buildSearchFilter)(list.search, ['`key`', '`group`', 'value']);
    if (search.clause) {
        where.push(search.clause);
        params.push(...search.params);
    }
    if (list.filters.group) {
        where.push('`group` = ?');
        params.push(list.filters.group);
    }
    const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const sortColumn = (0, pagination_1.safeSort)(list.sortBy, [...SORTABLE], 'id');
    const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM settings ${whereSql}`, params);
    const total = Number(countRow?.total ?? 0);
    const rows = await (0, database_1.query)(`SELECT * FROM settings ${whereSql} ORDER BY ${sortColumn} ${direction}, id DESC LIMIT ? OFFSET ?`, [...params, list.pageSize, (list.page - 1) * list.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, total, list.page, list.pageSize);
}
async function findSettingById(id) {
    return (0, database_1.queryOne)('SELECT * FROM settings WHERE id = ? LIMIT 1', [id]);
}
async function findSettingByKey(key) {
    return (0, database_1.queryOne)('SELECT * FROM settings WHERE `key` = ? LIMIT 1', [key]);
}
async function keyExists(key, excludeId) {
    const row = excludeId
        ? await (0, database_1.queryOne)('SELECT id FROM settings WHERE `key` = ? AND id <> ? LIMIT 1', [
            key,
            excludeId,
        ])
        : await (0, database_1.queryOne)('SELECT id FROM settings WHERE `key` = ? LIMIT 1', [key]);
    return row !== null;
}
async function createSetting(data) {
    const result = await (0, database_1.execute)('INSERT INTO settings (`key`, `group`, value) VALUES (?, ?, ?)', [data.key, data.group, data.value]);
    return result.insertId;
}
async function updateSetting(id, data) {
    const entries = Object.entries(data).filter(([key, value]) => ['key', 'group', 'value'].includes(key) && value !== undefined);
    if (entries.length === 0)
        return false;
    const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const result = await (0, database_1.execute)(`UPDATE settings SET ${setSql} WHERE id = ?`, [
        ...entries.map(([, value]) => value),
        id,
    ]);
    return result.affectedRows > 0;
}
async function deleteSetting(id) {
    const result = await (0, database_1.execute)('DELETE FROM settings WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
/** All settings as a flat key→value map, used to configure the storefront. */
async function settingsMap() {
    const rows = await (0, database_1.query)('SELECT `key`, value FROM settings');
    return Object.fromEntries(rows.map((row) => [row.key, row.value ?? '']));
}
/** Settings grouped by their `group` column — powers the grouped Settings UI. */
async function settingsByGroup() {
    const rows = await (0, database_1.query)('SELECT * FROM settings ORDER BY `group` ASC, `key` ASC');
    const grouped = {};
    for (const row of rows) {
        const group = (grouped[row.group] ??= []);
        group.push({
            id: row.id,
            key: row.key,
            group: row.group,
            value: row.value,
            created_at: row.created_at,
            updated_at: row.updated_at,
        });
    }
    return grouped;
}
async function listGroups() {
    return (0, database_1.query)('SELECT `group`, COUNT(*) AS total FROM settings GROUP BY `group` ORDER BY `group` ASC');
}
//# sourceMappingURL=setting.model.js.map