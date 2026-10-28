"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
const env_1 = require("../config/env");
const ApiError_1 = require("../utils/ApiError");
const jwt_1 = require("../utils/jwt");
const database_1 = require("../config/database");
function extractToken(req) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        return header.slice(7).trim();
    }
    const cookieToken = req.cookies?.[env_1.env.auth.cookieName];
    return cookieToken ?? null;
}
/**
 * Reject the request unless it carries a valid, unexpired access token for an
 * account that is still active. The user row is re-read on every request so a
 * role change, block, or deletion takes effect immediately rather than waiting
 * for the token to expire.
 */
async function authenticate(req, _res, next) {
    try {
        const token = extractToken(req);
        if (!token)
            throw ApiError_1.ApiError.unauthorized('Authentication required');
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const user = await (0, database_1.queryOne)('SELECT id, full_name, email, role, status, avatar FROM users WHERE id = ? LIMIT 1', [payload.sub]);
        if (!user)
            throw ApiError_1.ApiError.unauthorized('Account no longer exists');
        if (user.status === 'blocked')
            throw ApiError_1.ApiError.forbidden('This account has been blocked');
        if (user.status === 'inactive')
            throw ApiError_1.ApiError.forbidden('This account is inactive');
        req.user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            status: user.status,
            avatar: user.avatar,
        };
        next();
    }
    catch (error) {
        next(error);
    }
}
/** Attach `req.user` when a valid token exists, but never fail the request. */
async function optionalAuth(req, _res, next) {
    const token = extractToken(req);
    if (!token) {
        next();
        return;
    }
    try {
        await authenticate(req, _res, (err) => {
            if (err)
                throw err;
        });
    }
    catch {
        // ignore — this route does not require auth
    }
    next();
}
//# sourceMappingURL=auth.js.map