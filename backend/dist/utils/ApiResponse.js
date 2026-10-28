"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.created = created;
exports.paginated = paginated;
exports.noContent = noContent;
/**
 * Consistent success envelope. Every controller returns one of these so the
 * frontend never has to guess the shape of a response.
 */
function ok(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
}
function created(res, data, message = 'Created successfully') {
    return ok(res, data, message, 201);
}
function paginated(res, result, message = 'Success') {
    // DataTables' server-side protocol needs its own envelope; see
    // `middleware/dataTables.ts` for why only the list endpoints opt in.
    const draw = res.locals?.dataTablesDraw;
    if (typeof draw === 'number' && Number.isFinite(draw)) {
        return res.status(200).json({
            draw,
            // `total` is the filtered count. The unfiltered total is not tracked
            // separately, so both counters carry it — DataTables only pages on
            // `recordsFiltered`, and the difference is the "of N entries" caption.
            recordsTotal: result.meta.total,
            recordsFiltered: result.meta.total,
            data: result.data,
            meta: result.meta,
        });
    }
    return res.status(200).json({
        success: true,
        message,
        data: result.data,
        meta: result.meta,
    });
}
function noContent(res) {
    return res.status(204).send();
}
//# sourceMappingURL=ApiResponse.js.map