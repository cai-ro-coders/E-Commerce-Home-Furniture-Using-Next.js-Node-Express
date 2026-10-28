"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.safeEqual = safeEqual;
exports.checkPasswordStrength = checkPasswordStrength;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 12;
async function hashPassword(plain) {
    return bcryptjs_1.default.hash(plain, SALT_ROUNDS);
}
async function verifyPassword(plain, hash) {
    try {
        return await bcryptjs_1.default.compare(plain, hash);
    }
    catch {
        return false;
    }
}
/**
 * Constant-time-ish string compare so password reset tokens cannot be probed
 * character by character via response timing.
 */
function safeEqual(a, b) {
    if (a.length !== b.length)
        return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i += 1) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}
/** Server-side policy check — the client-side meter is only a hint. */
function checkPasswordStrength(password) {
    const errors = [];
    if (password.length < 8)
        errors.push('Password must be at least 8 characters long');
    if (!/[a-z]/.test(password))
        errors.push('Password must include a lowercase letter');
    if (!/[A-Z]/.test(password))
        errors.push('Password must include an uppercase letter');
    if (!/\d/.test(password))
        errors.push('Password must include a number');
    return { valid: errors.length === 0, errors };
}
//# sourceMappingURL=password.js.map