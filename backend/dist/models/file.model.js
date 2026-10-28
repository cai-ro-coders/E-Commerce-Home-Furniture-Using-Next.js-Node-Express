"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFiles = listFiles;
exports.findFileById = findFileById;
exports.createFile = createFile;
exports.updateFileCategory = updateFileCategory;
exports.deleteFile = deleteFile;
exports.fileStats = fileStats;
const database_1 = require("../config/database");
const pagination_1 = require("../utils/pagination");
const SORTABLE = ['id', 'name', 'original_name', 'category', 'size', 'created_at'];
async function listFiles(list) {
    const where = [];
    const params = [];
    const search = (0, pagination_1.buildSearchFilter)(list.search, ['f.name', 'f.original_name', 'f.mime_type']);
    if (search.clause) {
        where.push(search.clause);
        params.push(...search.params);
    }
    if (list.filters.category) {
        where.push('f.category = ?');
        params.push(list.filters.category);
    }
    const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const sortColumn = (0, pagination_1.safeSort)(list.sortBy, [...SORTABLE], 'id');
    const direction = list.sortDir === 'asc' ? 'ASC' : 'DESC';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM files f ${whereSql}`, params);
    const total = Number(countRow?.total ?? 0);
    const rows = await (0, database_1.query)(`SELECT f.*, u.full_name AS uploader_name
       FROM files f
       LEFT JOIN users u ON u.id = f.uploaded_by
       ${whereSql}
      ORDER BY f.${sortColumn} ${direction}, f.id DESC
      LIMIT ? OFFSET ?`, [...params, list.pageSize, (list.page - 1) * list.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, total, list.page, list.pageSize);
}
async function findFileById(id) {
    return (0, database_1.queryOne)(`SELECT f.*, u.full_name AS uploader_name FROM files f
      LEFT JOIN users u ON u.id = f.uploaded_by
     WHERE f.id = ? LIMIT 1`, [id]);
}
async function createFile(data) {
    const result = await (0, database_1.execute)(`INSERT INTO files (name, original_name, path, mime_type, size, category, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        data.name,
        data.original_name,
        data.path,
        data.mime_type,
        data.size,
        data.category,
        data.uploaded_by,
    ]);
    return result.insertId;
}
async function updateFileCategory(id, category) {
    const result = await (0, database_1.execute)('UPDATE files SET category = ? WHERE id = ?', [category, id]);
    return result.affectedRows > 0;
}
async function deleteFile(id) {
    const row = await (0, database_1.queryOne)('SELECT path FROM files WHERE id = ? LIMIT 1', [id]);
    if (!row)
        return null;
    await (0, database_1.execute)('DELETE FROM files WHERE id = ?', [id]);
    return { path: row.path };
}
async function fileStats() {
    return ((await (0, database_1.queryOne)(`
      SELECT COUNT(*)                                    AS total_files,
             COALESCE(SUM(size), 0)                      AS total_size,
             COALESCE(SUM(category = 'image'), 0)        AS images,
             COALESCE(SUM(category = 'document'), 0)     AS documents,
             COALESCE(SUM(category = 'contract'), 0)     AS contracts,
             COALESCE(SUM(category = 'invoice'), 0)      AS invoices,
             COALESCE(SUM(category = 'customer'), 0)     AS customer_files
        FROM files
    `)) ?? {});
}
//# sourceMappingURL=file.model.js.map