"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSRF_COOKIE = exports.CSRF_HEADER = void 0;
exports.csrfProtection = csrfProtection;
exports.issueCsrfToken = issueCsrfToken;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const ApiError_1 = require("../utils/ApiError");
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_COOKIE = 'csrf_token';
exports.CSRF_COOKIE = CSRF_COOKIE;
const CSRF_HEADER = 'x-csrf-token';
exports.CSRF_HEADER = CSRF_HEADER;
/**
 * CSRF protection using the double-submit-cookie pattern.
 *
 * Because the access token lives in an httpOnly cookie, a cross-site form post
 * would otherwise be authenticated automatically. Requiring the caller to also
 * send the token in a custom header means a third-party page cannot read it
 * (SameSite + SOP) and therefore cannot forge the request.
 *
 * The token is also readable by our own JS (`document.cookie`) so the frontend
 * can echo it back in the `x-csrf-token` header.
 */
function csrfProtection(req, res, next) {
    if (!env_1.env.auth.csrfProtection) {
        next();
        return;
    }
    let token = req.cookies?.[CSRF_COOKIE];
    if (!token) {
        token = crypto_1.default.randomBytes(24).toString('hex');
        res.cookie(CSRF_COOKIE, token, {
            httpOnly: false,
            sameSite: 'lax',
            secure: env_1.env.isProduction,
            domain: env_1.env.auth.cookieDomain,
            path: '/',
        });
    }
    // Expose it to the SPA on every response, including the first one.
    res.setHeader('x-csrf-token', token);
    req.csrfToken = token;
    if (SAFE_METHODS.has(req.method)) {
        next();
        return;
    }
    const headerValue = req.headers[CSRF_HEADER] ?? req.body?._csrf;
    if (!headerValue || headerValue !== token) {
        next(new ApiError_1.ApiError(403, 'Invalid or missing CSRF token. Refresh the page and try again.', 'CSRF_TOKEN_MISMATCH'));
        return;
    }
    next();
}
/** Issue a fresh CSRF cookie — called by the auth routes after login/refresh. */
function issueCsrfToken(res) {
    const token = crypto_1.default.randomBytes(24).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
        httpOnly: false,
        sameSite: 'lax',
        secure: env_1.env.isProduction,
        domain: env_1.env.auth.cookieDomain,
        path: '/',
    });
    res.setHeader('x-csrf-token', token);
    return token;
}
//# sourceMappingURL=csrf.js.map