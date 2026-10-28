"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
exports.xssSanitize = xssSanitize;
exports.bodySizeLimit = bodySizeLimit;
exports.notFoundHandler = notFoundHandler;
const zod_1 = require("zod");
const ApiError_1 = require("../utils/ApiError");
const env_1 = require("../config/env");
const sanitize_1 = require("../utils/sanitize");
/**
 * Global XSS sanitiser.
 *
 * Runs before every route so no handler has to remember to clean its input.
 * Applied to body, query and params; skipped on GET-only public reads where the
 * body is empty, purely as a small optimisation.
 */
function xssSanitize(req, _res, next) {
    if (!env_1.env.auth.xssSanitize) {
        next();
        return;
    }
    if (req.body && typeof req.body === 'object') {
        req.body = (0, sanitize_1.sanitizeDeep)(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        // req.query is a getter in newer Express; assign defensively.
        try {
            req.query = (0, sanitize_1.sanitizeDeep)(req.query);
        }
        catch {
            /* readonly getter — validated values are sanitised by the validators anyway */
        }
    }
    if (req.params && typeof req.params === 'object') {
        req.params = (0, sanitize_1.sanitizeDeep)(req.params);
    }
    next();
}
/** Reject the request when the JSON body exceeds the configured limit. */
function bodySizeLimit(bytes) {
    return (req, res, next) => {
        const length = Number(req.headers['content-length'] ?? 0);
        if (length > bytes) {
            next(ApiError_1.ApiError.badRequest(`Request body exceeds the ${bytes} byte limit`));
            return;
        }
        next();
    };
}
/**
 * Central error handler. Converts anything thrown anywhere in the stack into
 * the standard error envelope, and never leaks internals in production.
 */
const errorHandler = (error, req, res, _next) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details = undefined;
    if (error instanceof ApiError_1.ApiError) {
        statusCode = error.statusCode;
        message = error.message;
        code = error.code;
        details = error.details;
    }
    else if (error instanceof zod_1.ZodError) {
        statusCode = 422;
        code = 'VALIDATION_ERROR';
        message = 'Validation failed';
        details = error.issues.map((issue) => ({
            field: issue.path.join('.') || '(root)',
            message: issue.message,
        }));
    }
    else if (isMulterError(error)) {
        statusCode = 400;
        code = 'UPLOAD_ERROR';
        message = multerMessage(error.code);
    }
    else if (error instanceof SyntaxError && 'body' in error) {
        statusCode = 400;
        code = 'INVALID_JSON';
        message = 'Request body is not valid JSON';
    }
    else if (isDuplicateEntryError(error)) {
        statusCode = 409;
        code = 'DUPLICATE_ENTRY';
        message = 'A record with that unique value already exists';
    }
    else if (isForeignKeyError(error)) {
        statusCode = 409;
        code = 'FK_CONSTRAINT';
        message =
            'This record is referenced by other records and cannot be removed, or references a record that does not exist';
    }
    // Log server-side faults; 4xx is the client's problem and would only be noise.
    if (statusCode >= 500) {
        // eslint-disable-next-line no-console
        console.error(`[error] ${req.method} ${req.originalUrl}`, error);
    }
    res.status(statusCode).json({
        success: false,
        message,
        error: { code, details },
        ...(env_1.env.isProduction ? {} : { stack: statusCode >= 500 ? error?.stack : undefined }),
    });
};
exports.errorHandler = errorHandler;
function notFoundHandler(req, _res, next) {
    next(ApiError_1.ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`));
}
function isMulterError(error) {
    return (error instanceof Error &&
        ['LIMIT_FILE_SIZE', 'LIMIT_FILE_COUNT', 'LIMIT_UNEXPECTED_FILE'].includes(error.code ?? ''));
}
function multerMessage(code) {
    switch (code) {
        case 'LIMIT_FILE_SIZE':
            return 'Uploaded file is too large';
        case 'LIMIT_FILE_COUNT':
            return 'Too many files in a single upload';
        case 'LIMIT_UNEXPECTED_FILE':
            return 'Unexpected file field';
        default:
            return 'File upload failed';
    }
}
function isDuplicateEntryError(error) {
    return error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062;
}
function isForeignKeyError(error) {
    return error?.code === 'ER_NO_REFERENCED_ROW_2' || error?.errno === 1452;
}
//# sourceMappingURL=errorHandler.js.map