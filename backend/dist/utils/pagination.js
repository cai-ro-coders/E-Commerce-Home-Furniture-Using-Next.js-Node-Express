"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseListQuery = parseListQuery;
exports.buildSearchFilter = buildSearchFilter;
exports.escapeLike = escapeLike;
exports.buildPagedResult = buildPagedResult;
exports.safeSort = safeSort;
exports.safeSortExpression = safeSortExpression;
exports.toInt = toInt;
exports.toOptionalInt = toOptionalInt;
exports.clamp = clamp;
const ApiError_1 = require("./ApiError");
const MAX_PAGE_SIZE = 200;
/** Keys consumed by the list envelope itself; everything else is a filter. */
const RESERVED_QUERY_KEYS = new Set([
    'page',
    'page_size',
    'pagesize',
    'search',
    'sortby',
    'sort_by',
    'orderby',
    'order_by',
    'sortdir',
    'sort_dir',
    'draw',
    'start',
    'length',
    'search[value]',
    'order[0][dir]',
]);
/**
 * Normalise DataTables' server-side parameters into a `ListQuery`.
 *
 * DataTables sends: draw, start, length, search[value], order[0][column],
 * order[0][dir], and column filters as `columns[N][search][value]`.
 * We accept both that shape and a simpler REST shape (?page=&pageSize=&search=)
 * so the API is pleasant to use from curl/Postman as well.
 *
 * Filters are collected under three spellings so no caller has to guess:
 *   ?role=admin   ?filter[role]=admin   ?filter_role=admin
 * DataTables' per-column filters are folded in under a `columns_N` key, which
 * the models ignore unless they opt in.
 */
function parseListQuery(req) {
    const q = (req.query ?? {});
    const pageSize = clamp(toInt(q.pageSize ?? q.length, 10), 1, MAX_PAGE_SIZE);
    // DataTables paginates by record offset (`start`) rather than page number.
    // Deriving the page from it keeps `page` the single source of truth below.
    const start = Math.max(0, toInt(q.start, 0));
    const pageFromStart = pageSize > 0 ? Math.floor(start / pageSize) + 1 : 1;
    const page = clamp(toInt(q.page, pageFromStart), 1, Number.MAX_SAFE_INTEGER);
    const search = String(q.search ?? '').trim();
    const sortBy = String(q.sortBy ?? q.orderBy ?? 'id').trim() || 'id';
    const sortDirRaw = String(q.sortDir ?? q['order[0][dir]'] ?? 'desc').toLowerCase();
    const sortDir = sortDirRaw === 'asc' ? 'asc' : 'desc';
    const filters = {};
    const put = (name, value) => {
        if (!name || value === undefined || value === null || value === '')
            return;
        if (typeof value === 'object')
            return; // repeated params arrive as arrays
        filters[name] = String(value);
    };
    for (const [key, value] of Object.entries(q)) {
        // `filter[role]` / `filter_role` / `filterRole`
        const explicit = key.match(/^filter(?:\[|_)?([A-Za-z0-9_]+)\]?$/);
        if (explicit) {
            put(snakeCase(explicit[1]), value);
            continue;
        }
        // `columns[2][search][value]`
        const column = key.match(/^columns\[(\d+)\]\[search\]\[value\]$/);
        if (column) {
            put(`columns_${column[1]}`, value);
            continue;
        }
        if (RESERVED_QUERY_KEYS.has(key.toLowerCase()))
            continue;
        put(snakeCase(key), value);
    }
    return { page, pageSize, search, sortBy, sortDir, filters };
}
/** `categoryId` / `CategoryID` -> `category_id`, so one spelling serves every layer. */
function snakeCase(key) {
    return key
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();
}
/**
 * Build a `LIKE ... OR ...` fragment from a set of columns.
 * The value is still bound as a parameter, so `%` inside user input is escaped.
 */
function buildSearchFilter(search, columns) {
    if (!search || columns.length === 0)
        return { clause: '', params: [] };
    const like = `%${escapeLike(search)}%`;
    return {
        clause: `(${columns.map((col) => `${col} LIKE ? ESCAPE '\\\\'`).join(' OR ')})`,
        params: columns.map(() => like),
    };
}
/** Escape LIKE wildcards so a user searching for "100%" doesn't match everything. */
function escapeLike(value) {
    return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}
function buildPagedResult(rows, total, page, pageSize) {
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = total === 0 ? 0 : Math.min(page * pageSize, total);
    return {
        data: rows,
        meta: { page, pageSize, total, totalPages, from, to },
    };
}
/**
 * Whitelist a sort column against the columns the table actually exposes.
 * This is the other half of SQL-injection defence for ORDER BY: the direction
 * is coerced to a literal, and the column must be in the allow-list.
 */
function safeSort(column, allowed, fallback) {
    return allowed.includes(column) ? column : fallback;
}
/**
 * Whitelist a sort field and map it to the SQL expression it stands for.
 *
 * Joined and computed columns are exposed under a logical name that is *not* a
 * column on the base table (`product_name` -> `p.name`, `total_spent` -> a
 * subquery alias). Prefixing those with the base alias — `r.product_name` — is
 * invalid MySQL, so the ORDER BY clause must be built from this map instead of
 * deriving the column name from the client input.
 *
 * Both the returned expression and the direction are fixed by the allow-list,
 * so nothing the client sends reaches the SQL text.
 */
function safeSortExpression(column, allowed, fallback) {
    return allowed[column] ?? allowed[fallback] ?? fallback;
}
function toInt(value, fallback) {
    if (value === undefined || value === null || value === '')
        return fallback;
    const parsed = parseInt(String(value), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}
function toOptionalInt(value) {
    if (value === undefined || value === null || value === '')
        return undefined;
    const parsed = parseInt(String(value), 10);
    if (Number.isNaN(parsed))
        throw ApiError_1.ApiError.badRequest('Expected an integer value');
    return parsed;
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
//# sourceMappingURL=pagination.js.map