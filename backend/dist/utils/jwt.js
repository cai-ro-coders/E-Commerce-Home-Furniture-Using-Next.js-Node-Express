"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.sha256 = sha256;
exports.randomToken = randomToken;
exports.randomOrderNumber = randomOrderNumber;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const ApiError_1 = require("./ApiError");
function signAccessToken(payload) {
    const data = {
        sub: payload.id,
        email: payload.email,
        role: payload.role,
        full_name: payload.fullName,
        type: 'access',
    };
    return jsonwebtoken_1.default.sign(data, env_1.env.auth.jwtSecret, {
        expiresIn: env_1.env.auth.accessExpires,
    });
}
function signRefreshToken(userId, sessionId) {
    const data = { sub: userId, sid: sessionId, type: 'refresh' };
    return jsonwebtoken_1.default.sign(data, env_1.env.auth.jwtSecret, {
        expiresIn: env_1.env.auth.refreshExpires,
    });
}
function verifyAccessToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.auth.jwtSecret);
        if (decoded.type !== 'access')
            throw ApiError_1.ApiError.unauthorized('Invalid token type');
        return decoded;
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError)
            throw error;
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new ApiError_1.ApiError(401, 'Session expired, please sign in again', 'TOKEN_EXPIRED');
        }
        throw ApiError_1.ApiError.unauthorized('Invalid or tampered token');
    }
}
function verifyRefreshToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.auth.jwtSecret);
        if (decoded.type !== 'refresh')
            throw ApiError_1.ApiError.unauthorized('Invalid token type');
        return decoded;
    }
    catch {
        throw ApiError_1.ApiError.unauthorized('Invalid refresh token');
    }
}
/** Refresh tokens are stored server-side as a SHA-256 hash, never in plaintext. */
function sha256(value) {
    return crypto_1.default.createHash('sha256').update(value).digest('hex');
}
/** Opaque, URL-safe token for password-reset links. */
function randomToken(bytes = 32) {
    return crypto_1.default.randomBytes(bytes).toString('hex');
}
function randomOrderNumber() {
    const now = new Date();
    const stamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
    ].join('');
    const random = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
    return `ORD-${stamp}-${random}`;
}
//# sourceMappingURL=jwt.js.map