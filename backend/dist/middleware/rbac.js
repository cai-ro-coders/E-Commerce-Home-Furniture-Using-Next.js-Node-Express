"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireStaff = exports.requireAuth = void 0;
exports.requireRole = requireRole;
const ApiError_1 = require("../utils/ApiError");
/**
 * Role-based access control.
 *
 * `admin` is deliberately NOT part of the public role list here — every check
 * is an explicit allow-list, so adding a new role is a conscious decision
 * rather than something that silently inherits admin powers.
 */
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            next(ApiError_1.ApiError.unauthorized());
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(ApiError_1.ApiError.forbidden(`This action requires one of the following roles: ${roles.join(', ')}`));
            return;
        }
        next();
    };
}
/** Any signed-in user (admin, staff, or customer). */
const requireAuth = (req, _res, next) => {
    if (!req.user) {
        next(ApiError_1.ApiError.unauthorized());
        return;
    }
    next();
};
exports.requireAuth = requireAuth;
/** Admin + staff — i.e. back-office users, not customers. */
exports.requireStaff = requireRole('admin', 'staff');
/** Admin only. */
exports.requireAdmin = requireRole('admin');
//# sourceMappingURL=rbac.js.map