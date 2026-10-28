"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeOtherSessions = void 0;
exports.clearAuthCookies = clearAuthCookies;
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.changePassword = changePassword;
exports.updateProfile = updateProfile;
exports.purgeExpiredSessions = purgeExpiredSessions;
exports.currentRefreshHash = currentRefreshHash;
exports.getUserSessions = getUserSessions;
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const ApiError_1 = require("../utils/ApiError");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const csrf_1 = require("../middleware/csrf");
const activityLog_1 = require("../middleware/activityLog");
const user_model_1 = require("../models/user.model");
const session_model_1 = require("../models/session.model");
Object.defineProperty(exports, "revokeOtherSessions", { enumerable: true, get: function () { return session_model_1.revokeOtherSessions; } });
const REFRESH_REMEMBER_DAYS = 30;
const REFRESH_DEFAULT_DAYS = 7;
const RESET_TOKEN_TTL_MINUTES = 60;
function clientIp(req) {
    return req.ip ?? null;
}
function userAgent(req) {
    return req.headers['user-agent']?.slice(0, 255) ?? null;
}
/** Set httpOnly auth cookies. `maxAge: undefined` creates a session cookie. */
function setAuthCookies(res, accessToken, refreshToken, rememberMe) {
    const base = {
        httpOnly: true,
        sameSite: 'lax',
        secure: env_1.env.isProduction,
        domain: env_1.env.auth.cookieDomain,
        path: '/',
    };
    res.cookie(env_1.env.auth.cookieName, accessToken, {
        ...base,
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });
    const days = rememberMe ? REFRESH_REMEMBER_DAYS : REFRESH_DEFAULT_DAYS;
    res.cookie(env_1.env.auth.refreshCookieName, refreshToken, {
        ...base,
        maxAge: days * 24 * 60 * 60 * 1000,
    });
}
function clearAuthCookies(res) {
    const options = {
        httpOnly: true,
        sameSite: 'lax',
        secure: env_1.env.isProduction,
        domain: env_1.env.auth.cookieDomain,
        path: '/',
    };
    res.clearCookie(env_1.env.auth.cookieName, options);
    res.clearCookie(env_1.env.auth.refreshCookieName, options);
}
function toAuthUser(row) {
    return {
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        role: row.role,
        status: row.status,
        avatar: row.avatar,
    };
}
/**
 * Create a server-side session row and mint the token pair.
 *
 * The session id has to exist before the refresh token is signed (the id is
 * embedded in the payload), so the row is inserted with a placeholder hash and
 * immediately updated. Both statements are in one transaction so a failure
 * cannot leave an orphaned placeholder session behind.
 */
async function issueSession(user, req, rememberMe) {
    const days = rememberMe ? REFRESH_REMEMBER_DAYS : REFRESH_DEFAULT_DAYS;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return (0, database_1.transaction)(async (connection) => {
        const [insert] = await connection.execute('INSERT INTO sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)', [user.id, 'pending', userAgent(req), clientIp(req), expiresAt]);
        const sessionId = insert.insertId;
        const accessToken = (0, jwt_1.signAccessToken)({
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.full_name,
        });
        const refreshToken = (0, jwt_1.signRefreshToken)(user.id, sessionId);
        // Store only the hash: a leaked database row cannot be replayed as a token.
        await connection.execute('UPDATE sessions SET refresh_token_hash = ?, last_used_at = NOW() WHERE id = ?', [(0, jwt_1.sha256)(refreshToken), sessionId]);
        return { user, accessToken, refreshToken };
    });
}
async function register(req, res, data) {
    if (await (0, user_model_1.emailExists)(data.email)) {
        throw ApiError_1.ApiError.conflict('An account with that email already exists');
    }
    const password = await (0, password_1.hashPassword)(data.password);
    const userId = await (0, user_model_1.createUser)({
        full_name: data.full_name,
        email: data.email,
        password,
        phone: data.phone ?? null,
        role: 'customer',
        status: 'active',
    });
    const created = await (0, user_model_1.findUserById)(userId);
    if (!created)
        throw ApiError_1.ApiError.internal('Failed to create account');
    const user = toAuthUser(created);
    const { accessToken, refreshToken } = await issueSession(user, req, false);
    setAuthCookies(res, accessToken, refreshToken, false);
    (0, csrf_1.issueCsrfToken)(res);
    (0, activityLog_1.logActivity)(req, userId, { action: 'register', entity: 'user', entityId: userId, description: 'Account created' });
    return { user, accessToken };
}
async function login(req, res, data) {
    const ip = clientIp(req);
    const ua = userAgent(req);
    const user = await (0, user_model_1.findUserByEmail)(data.email);
    // Always run a bcrypt comparison so a missing account and a wrong password
    // take the same time — otherwise response timing enumerates valid emails.
    const hash = user?.password ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const passwordMatches = await (0, password_1.verifyPassword)(data.password, hash);
    if (!user || !passwordMatches) {
        await (0, user_model_1.writeLoginHistory)({
            userId: user?.id ?? null,
            email: data.email,
            success: false,
            reason: user ? 'bad_password' : 'unknown_email',
            ip,
            userAgent: ua,
        });
        throw ApiError_1.ApiError.unauthorized('Incorrect email or password');
    }
    if (user.status === 'blocked') {
        await (0, user_model_1.writeLoginHistory)({ userId: user.id, email: data.email, success: false, reason: 'user_blocked', ip, userAgent: ua });
        throw ApiError_1.ApiError.forbidden('This account has been blocked. Contact support.');
    }
    if (user.status === 'inactive') {
        await (0, user_model_1.writeLoginHistory)({ userId: user.id, email: data.email, success: false, reason: 'user_inactive', ip, userAgent: ua });
        throw ApiError_1.ApiError.forbidden('This account is inactive. Contact support.');
    }
    await (0, user_model_1.recordSuccessfulLogin)(user.id, ip);
    await (0, user_model_1.writeLoginHistory)({ userId: user.id, email: data.email, success: true, ip, userAgent: ua });
    const authUser = toAuthUser(user);
    const { accessToken, refreshToken } = await issueSession(authUser, req, data.remember_me);
    setAuthCookies(res, accessToken, refreshToken, data.remember_me);
    (0, csrf_1.issueCsrfToken)(res);
    (0, activityLog_1.logActivity)(req, user.id, { action: 'login', entity: 'user', entityId: user.id, description: 'Signed in' });
    return { user: authUser, accessToken };
}
/**
 * Exchange a valid refresh cookie for a new access token.
 * Rotates the refresh token and revokes the old session row (reuse detection).
 */
async function refresh(req, res) {
    const token = req.cookies?.[env_1.env.auth.refreshCookieName];
    if (!token)
        throw ApiError_1.ApiError.unauthorized('No refresh token provided');
    const payload = (0, jwt_1.verifyRefreshToken)(token);
    const tokenHash = (0, jwt_1.sha256)(token);
    const session = await (0, database_1.queryOne)('SELECT id, user_id, expires_at, revoked_at FROM sessions WHERE refresh_token_hash = ? LIMIT 1', [tokenHash]);
    if (!session || session.revoked_at) {
        // A revoked token being replayed suggests theft: drop every session.
        if (session) {
            await (0, database_1.execute)('UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [
                session.user_id,
            ]);
            clearAuthCookies(res);
            throw ApiError_1.ApiError.unauthorized('Session reuse detected. Please sign in again.');
        }
        throw ApiError_1.ApiError.unauthorized('Invalid session');
    }
    if (new Date(session.expires_at.replace(' ', 'T')).getTime() < Date.now()) {
        throw ApiError_1.ApiError.unauthorized('Session expired, please sign in again');
    }
    const user = await (0, user_model_1.findUserById)(session.user_id);
    if (!user)
        throw ApiError_1.ApiError.unauthorized('Account no longer exists');
    if (user.status !== 'active')
        throw ApiError_1.ApiError.forbidden('This account is not active');
    const accessToken = (0, jwt_1.signAccessToken)({
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
    });
    const newRefreshToken = (0, jwt_1.signRefreshToken)(user.id, session.id);
    // Rotate in place: same session row, new hash. `last_used_at` is what the
    // account page shows as "last active", so it moves with the rotation.
    await (0, database_1.execute)('UPDATE sessions SET refresh_token_hash = ?, last_used_at = NOW() WHERE id = ?', [
        (0, jwt_1.sha256)(newRefreshToken),
        session.id,
    ]);
    const rememberCookie = req.cookies?.[env_1.env.auth.cookieName]?.length;
    setAuthCookies(res, accessToken, newRefreshToken, Boolean(rememberCookie));
    (0, csrf_1.issueCsrfToken)(res);
    return { user: toAuthUser(user), accessToken };
}
async function logout(req, res) {
    const token = req.cookies?.[env_1.env.auth.refreshCookieName];
    if (token) {
        await (0, database_1.execute)('UPDATE sessions SET revoked_at = NOW() WHERE refresh_token_hash = ?', [(0, jwt_1.sha256)(token)]);
    }
    if (req.user) {
        (0, activityLog_1.logActivity)(req, req.user.id, { action: 'logout', entity: 'user', entityId: req.user.id, description: 'Signed out' });
    }
    clearAuthCookies(res);
}
/**
 * Issue a password-reset token.
 *
 * The endpoint always succeeds, whether or not the email exists, so it cannot
 * be used to discover which addresses are registered. In development the token
 * is returned in the response (there is no mail transport wired up yet).
 */
async function forgotPassword(req, email) {
    const user = await (0, user_model_1.findUserByEmail)(email);
    if (!user)
        return {};
    const token = (0, jwt_1.randomToken)(32);
    await (0, database_1.execute)('DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL', [user.id]);
    await (0, database_1.execute)('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [user.id, (0, jwt_1.sha256)(token), new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000)]);
    (0, activityLog_1.logActivity)(req, user.id, {
        action: 'password_reset',
        entity: 'user',
        entityId: user.id,
        description: 'Password reset requested',
    });
    return env_1.env.isProduction ? {} : { token };
}
async function resetPassword(token, password) {
    const strength = (0, password_1.checkPasswordStrength)(password);
    if (!strength.valid) {
        throw ApiError_1.ApiError.unprocessable('Password does not meet the security policy', strength.errors);
    }
    const record = await (0, database_1.queryOne)('SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = ? LIMIT 1', [(0, jwt_1.sha256)(token)]);
    if (!record || record.used_at)
        throw ApiError_1.ApiError.badRequest('This reset link is invalid or has already been used');
    if (new Date(record.expires_at.replace(' ', 'T')).getTime() < Date.now()) {
        throw ApiError_1.ApiError.badRequest('This reset link has expired. Please request a new one.');
    }
    await (0, database_1.transaction)(async (connection) => {
        const hashed = await (0, password_1.hashPassword)(password);
        await connection.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, record.user_id]);
        await connection.execute('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [record.id]);
        // Force every device to sign in again after a password change.
        await connection.execute('UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [record.user_id]);
    });
}
async function changePassword(userId, currentPassword, newPassword) {
    const user = await (0, user_model_1.findUserById)(userId, true);
    if (!user?.password)
        throw ApiError_1.ApiError.notFound('Account not found');
    const matches = await (0, password_1.verifyPassword)(currentPassword, user.password);
    if (!matches)
        throw ApiError_1.ApiError.badRequest('Current password is incorrect');
    if (await (0, password_1.verifyPassword)(newPassword, user.password)) {
        throw ApiError_1.ApiError.badRequest('New password must be different from the current password');
    }
    const hashed = await (0, password_1.hashPassword)(newPassword);
    await (0, database_1.execute)('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    // Revoke other sessions but keep the current one usable.
    await (0, database_1.execute)('UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [userId]);
}
async function updateProfile(userId, data) {
    const fields = {};
    if (data.full_name !== undefined)
        fields.full_name = data.full_name;
    if (data.phone !== undefined)
        fields.phone = data.phone;
    if (data.avatar !== undefined)
        fields.avatar = data.avatar;
    if (Object.keys(fields).length > 0) {
        const setSql = Object.keys(fields).map((key) => `\`${key}\` = ?`).join(', ');
        await (0, database_1.execute)(`UPDATE users SET ${setSql} WHERE id = ?`, [...Object.values(fields), userId]);
    }
    const updated = await (0, user_model_1.findUserById)(userId);
    if (!updated)
        throw ApiError_1.ApiError.notFound('Account not found');
    return toAuthUser(updated);
}
/** Housekeeping: drop sessions that expired more than a day ago. */
async function purgeExpiredSessions() {
    const result = await (0, database_1.execute)('DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL 1 DAY');
    return result.affectedRows;
}
/** Hash of the refresh cookie on this request — the current device's identity. */
function currentRefreshHash(req) {
    const token = req.cookies?.[env_1.env.auth.refreshCookieName];
    return token ? (0, jwt_1.sha256)(token) : null;
}
/** The signed-in user's active devices, newest activity first. */
async function getUserSessions(req, list) {
    return (0, session_model_1.listSessions)(req.user.id, currentRefreshHash(req), list);
}
//# sourceMappingURL=auth.service.js.map