"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountHandler = exports.loginHistoryHandler = exports.revokeOtherSessionsHandler = exports.revokeSessionHandler = exports.listSessionsHandler = exports.updateProfileHandler = exports.changePasswordHandler = exports.resetPasswordHandler = exports.forgotPasswordHandler = exports.meHandler = exports.refreshHandler = exports.logoutHandler = exports.loginHandler = exports.registerHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const pagination_1 = require("../utils/pagination");
const auth_service_1 = require("../services/auth.service");
const user_model_1 = require("../models/user.model");
const session_model_1 = require("../models/session.model");
const cart_service_1 = require("../services/cart.service");
const notification_service_1 = require("../services/notification.service");
const database_1 = require("../config/database");
exports.registerHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, auth_service_1.register)(req, res, req.body);
    return (0, ApiResponse_1.created)(res, result, 'Account created successfully');
});
exports.loginHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, auth_service_1.login)(req, res, req.body);
    return (0, ApiResponse_1.ok)(res, result, 'Signed in successfully');
});
exports.logoutHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, auth_service_1.logout)(req, res);
    return (0, ApiResponse_1.ok)(res, null, 'Signed out successfully');
});
exports.refreshHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, auth_service_1.refresh)(req, res);
    return (0, ApiResponse_1.ok)(res, result, 'Session refreshed');
});
exports.meHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await (0, user_model_1.findUserById)(req.user.id);
    if (!user)
        throw ApiError_1.ApiError.notFound('Account not found');
    const [cart, notifications] = await Promise.all([
        (0, cart_service_1.getCartBadge)(req.user.id),
        (0, notification_service_1.getUnreadCount)(req.user.id),
    ]);
    const { password: _password, ...safeUser } = user;
    return (0, ApiResponse_1.ok)(res, { user: safeUser, cart, notifications }, 'Current user');
});
exports.forgotPasswordHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, auth_service_1.forgotPassword)(req, req.body.email);
    // The same message is returned whether or not the account exists.
    return (0, ApiResponse_1.ok)(res, result, 'If an account with that email exists, a password reset link has been sent.');
});
exports.resetPasswordHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, auth_service_1.resetPassword)(req.body.token, req.body.password);
    return (0, ApiResponse_1.ok)(res, null, 'Password has been reset. Please sign in.');
});
exports.changePasswordHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, auth_service_1.changePassword)(req.user.id, req.body.current_password, req.body.password);
    return (0, ApiResponse_1.ok)(res, null, 'Password updated successfully');
});
exports.updateProfileHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await (0, auth_service_1.updateProfile)(req.user.id, req.body);
    return (0, ApiResponse_1.ok)(res, { user }, 'Profile updated successfully');
});
/** Devices currently signed in on this account, with the caller's own marked. */
exports.listSessionsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.paginated)(res, await (0, auth_service_1.getUserSessions)(req, (0, pagination_1.parseListQuery)(req)));
});
exports.revokeSessionHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const currentHash = (0, auth_service_1.currentRefreshHash)(req);
    if (!(await (0, session_model_1.revokeSession)(id, req.user.id))) {
        throw ApiError_1.ApiError.notFound('That session is no longer active');
    }
    void currentHash;
    return (0, ApiResponse_1.ok)(res, { id }, 'Session signed out');
});
exports.revokeOtherSessionsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const revoked = await (0, auth_service_1.revokeOtherSessions)(req.user.id, (0, auth_service_1.currentRefreshHash)(req) ?? '');
    return (0, ApiResponse_1.ok)(res, { revoked }, `Signed out of ${revoked} other device${revoked === 1 ? '' : 's'}`);
});
/** Recent sign-in attempts on this account, successful and failed. */
exports.loginHistoryHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    return (0, ApiResponse_1.ok)(res, await (0, user_model_1.listLoginHistory)(req.user.id, limit));
});
/** The signed-in customer's own addresses, profile extras, and login history. */
exports.accountHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const [user, addresses, history, wishlistCount] = await Promise.all([
        (0, user_model_1.findUserById)(userId),
        (0, user_model_1.listAddressesByUser)(userId),
        (0, user_model_1.listLoginHistory)(userId, 20),
        (0, database_1.query)('SELECT COUNT(*) AS total FROM wishlists WHERE user_id = ?', [userId]),
    ]);
    if (!user)
        throw ApiError_1.ApiError.notFound('Account not found');
    const { password: _password, ...safeUser } = user;
    return (0, ApiResponse_1.ok)(res, {
        user: safeUser,
        addresses,
        login_history: history,
        wishlist_count: Number(wishlistCount[0]?.total ?? 0),
    });
});
//# sourceMappingURL=auth.controller.js.map