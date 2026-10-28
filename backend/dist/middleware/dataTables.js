"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataTablesAdapter = dataTablesAdapter;
/** Read `{ value: 'x' }` out of DataTables' nested `search`/`search[value]` slot. */
function nestedValue(input) {
    if (!input || typeof input !== 'object')
        return undefined;
    const value = input.value;
    return typeof value === 'string' ? value : undefined;
}
/**
 * Adapt DataTables' server-side request to the flat REST query our list
 * endpoints speak, and mark the response so `paginated()` can answer in
 * DataTables' shape.
 *
 * DataTables 3 posts its state as bracketed names. Express parses those with
 * `qs` into nested objects:
 *
 *   draw=2&start=20&length=10
 *   search[value]=oak
 *   order[0][column]=1&order[0][dir]=asc
 *   columns[1][data]=name
 *   columns[3][search][value]=active
 *
 * becomes `{ draw, start, length, search: {value}, order: [{column,dir}],
 * columns: [ , {data}, , {search:{value}}] }`. The list validators expect flat
 * strings, so this middleware derives the equivalents they already understand:
 *
 *   start + length      -> page (handled in `parseListQuery`)
 *   search.value        -> search
 *   order[0] + columns  -> sortBy / sortDir
 *   columns[i].search   -> columns_i  (per-column filter, opt-in per model)
 *
 * Non-DataTables callers are untouched: without a `draw` parameter the
 * middleware returns immediately and the REST query shape is used verbatim.
 */
function dataTablesAdapter(req, res, next) {
    const raw = (req.query ?? {});
    const draw = raw.draw;
    if (draw === undefined || draw === '') {
        next();
        return;
    }
    const drawNumber = Number(draw);
    if (Number.isFinite(drawNumber))
        res.locals.dataTablesDraw = drawNumber;
    // Keep the flat keys (`draw`, `start`, `length`, `page`, `pageSize`, ...) and
    // drop the three bracketed ones, which are replaced by their equivalents.
    const flat = {};
    for (const [key, value] of Object.entries(raw)) {
        if (key === 'columns' || key === 'order' || key === 'search')
            continue;
        flat[key] = value;
    }
    const search = nestedValue(raw.search);
    if (search)
        flat.search = search;
    // Derive page/pageSize here rather than in `parseListQuery`: the list query
    // schema materialises its `page`/`pageSize` defaults before the parser sees
    // them, which would shadow DataTables' `start`/`length`.
    const length = Number(raw.length);
    const pageSize = Number.isFinite(length) && length > 0 ? Math.min(length, 200) : undefined;
    if (pageSize) {
        flat.pageSize = String(pageSize);
        const start = Math.max(0, Number(raw.start) || 0);
        flat.page = String(Math.floor(start / pageSize) + 1);
    }
    const columns = Array.isArray(raw.columns)
        ? raw.columns
        : [];
    const order = Array.isArray(raw.order)
        ? raw.order
        : [];
    const firstOrder = order[0];
    if (firstOrder) {
        const dir = String(firstOrder.dir ?? '').toLowerCase();
        if (dir === 'asc' || dir === 'desc')
            flat.sortDir = dir;
        const index = Number(firstOrder.column);
        const field = Number.isFinite(index) ? columns[index]?.data : undefined;
        // `__actions` / null are placeholders for non-data columns and must never
        // reach the ORDER BY builder.
        if (typeof field === 'string' && field && field !== '__actions') {
            flat.sortBy = field;
        }
    }
    // Per-column filters, flattened to `columns_0`, `columns_1`, ... so the list
    // schema accepts them. Models only read the ones they opt into.
    columns.forEach((column, index) => {
        const value = nestedValue(column?.search);
        if (value)
            flat[`columns_${index}`] = value;
    });
    req.query = flat;
    next();
}
//# sourceMappingURL=dataTables.js.map