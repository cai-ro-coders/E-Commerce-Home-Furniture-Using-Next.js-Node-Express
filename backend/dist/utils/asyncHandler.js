"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
exports.validate = validate;
const zod_1 = require("zod");
const ApiError_1 = require("./ApiError");
/**
 * Wraps an async handler so rejected promises reach Express' error pipeline
 * instead of hanging the request. Every async route handler uses this.
 */
function asyncHandler(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}
/** Parse and validate `req[source]` against a Zod schema, replacing it with the typed result. */
function validate(schema, source = 'body') {
    return (req, _res, next) => {
        try {
            const parsed = schema.parse(req[source]);
            // `req.query` and `req.params` are getter-only on Express 5, but on
            // Express 4 they are plain properties, so assignment is safe here.
            req[source] = parsed;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                next(ApiError_1.ApiError.unprocessable('Validation failed', error.issues.map((issue) => ({
                    field: issue.path.join('.') || '(root)',
                    message: issue.message,
                }))));
                return;
            }
            next(error);
        }
    };
}
//# sourceMappingURL=asyncHandler.js.map