"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
function keyGenerator(req) {
    // Behind a proxy, trust X-Forwarded-For only when the app runs behind one.
    if (env_1.env.isProduction && req.headers['x-forwarded-for']) {
        const forwarded = req.headers['x-forwarded-for'];
        const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
        if (first)
            return first.trim();
    }
    return req.ip ?? 'unknown';
}
const shared = {
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests, please slow down and try again shortly.',
            error: { code: 'TOO_MANY_REQUESTS' },
        });
    },
};
/** Broad ceiling applied to the whole /api surface. */
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.rateLimit.windowMs,
    max: env_1.env.rateLimit.max,
    ...shared,
});
/** Tight limit on credential endpoints to blunt brute-force attempts. */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.rateLimit.windowMs,
    max: env_1.env.rateLimit.authMax,
    skipSuccessfulRequests: true, // only failed attempts count toward the limit
    ...shared,
});
/** Limit writes (POST/PUT/PATCH/DELETE) more aggressively than reads. */
exports.writeLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.rateLimit.windowMs,
    max: Math.max(60, Math.floor(env_1.env.rateLimit.max / 4)),
    skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method),
    ...shared,
});
//# sourceMappingURL=rateLimit.js.map