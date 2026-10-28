"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = void 0;
exports.getUsers = getUsers;
exports.getUserStats = getUserStats;
exports.getUserById = getUserById;
exports.createNewUser = createNewUser;
exports.updateNewUser = updateNewUser;
exports.updateCustomer = updateCustomer;
exports.removeUser = removeUser;
exports.setUserRole = setUserRole;
exports.setUserStatus = setUserStatus;
exports.getActivityLog = getActivityLog;
exports.getCustomerOrders = getCustomerOrders;
exports.getCustomerAddresses = getCustomerAddresses;
exports.addCustomerAddress = addCustomerAddress;
exports.customerCount = customerCount;
const database_1 = require("../config/database");
const ApiError_1 = require("../utils/ApiError");
const password_1 = require("../utils/password");
const user_model_1 = require("../models/user.model");
Object.defineProperty(exports, "deleteUser", { enumerable: true, get: function () { return user_model_1.deleteUser; } });
const database_2 = require("../config/database");
async function getUsers(list) {
    return (0, user_model_1.listUsers)(list);
}
/** Counts behind the Users module's stat cards. */
async function getUserStats() {
    const [row] = await (0, database_1.query)(`SELECT COUNT(*)                                          AS total,
            SUM(role = 'admin')                               AS admins,
            SUM(role = 'staff')                               AS staff,
            SUM(role = 'customer')                            AS customers,
            SUM(status = 'active')                            AS active,
            SUM(status = 'inactive')                          AS inactive,
            SUM(status = 'blocked')                           AS blocked,
            SUM(created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) AS new_this_month
       FROM users`);
    return {
        total: Number(row?.total ?? 0),
        admins: Number(row?.admins ?? 0),
        staff: Number(row?.staff ?? 0),
        customers: Number(row?.customers ?? 0),
        active: Number(row?.active ?? 0),
        inactive: Number(row?.inactive ?? 0),
        blocked: Number(row?.blocked ?? 0),
        new_this_month: Number(row?.new_this_month ?? 0),
    };
}
async function getUserById(id) {
    const user = await (0, user_model_1.findUserById)(id);
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    const [addresses, orders, loginHistory, activities] = await Promise.all([
        (0, user_model_1.listAddressesByUser)(id),
        (0, user_model_1.getCustomerOrderSummary)(id, 10),
        (0, user_model_1.listLoginHistory)(id, 10),
        (0, database_1.query)('SELECT action, entity, description, ip_address, created_at FROM user_activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 15', [id]),
    ]);
    return { ...user, addresses, orders, login_history: loginHistory, activities };
}
async function createNewUser(data) {
    if (await (0, user_model_1.emailExists)(data.email)) {
        throw ApiError_1.ApiError.conflict('A user with that email already exists');
    }
    const id = await (0, user_model_1.createUser)({
        full_name: data.full_name,
        email: data.email,
        password: await (0, password_1.hashPassword)(data.password),
        phone: data.phone ?? null,
        avatar: data.avatar ?? null,
        role: data.role,
        status: data.status,
    });
    return (0, user_model_1.findUserById)(id);
}
async function updateNewUser(id, data, actorId) {
    const existing = await (0, user_model_1.findUserById)(id);
    if (!existing)
        throw ApiError_1.ApiError.notFound('User not found');
    if (data.email && typeof data.email === 'string' && data.email !== existing.email) {
        if (await (0, user_model_1.emailExists)(data.email, id)) {
            throw ApiError_1.ApiError.conflict('A user with that email already exists');
        }
    }
    // A blank password field on the edit form means "leave the hash unchanged".
    const patch = {};
    if (data.full_name !== undefined)
        patch.full_name = data.full_name;
    if (data.email !== undefined)
        patch.email = data.email;
    if (data.phone !== undefined)
        patch.phone = data.phone;
    if (data.avatar !== undefined)
        patch.avatar = data.avatar;
    if (data.role !== undefined)
        patch.role = data.role;
    if (data.status !== undefined)
        patch.status = data.status;
    if (typeof data.password === 'string' && data.password.length > 0) {
        patch.password = await (0, password_1.hashPassword)(data.password);
    }
    // Guard against an admin locking themselves out of their own account.
    if (id === actorId && patch.role !== undefined && patch.role !== 'admin') {
        throw ApiError_1.ApiError.badRequest('You cannot change your own role');
    }
    if (id === actorId && patch.status !== undefined && patch.status !== 'active') {
        throw ApiError_1.ApiError.badRequest('You cannot deactivate your own account');
    }
    await (0, user_model_1.updateUser)(id, patch);
    return (0, user_model_1.findUserById)(id);
}
/**
 * Edit a customer from the Customers module.
 *
 * Narrower than `updateUser`: no role or password changes here, so a customer
 * can never be promoted (or have their credentials replaced) by a screen that
 * is not the Users module.
 */
async function updateCustomer(id, data) {
    const user = await (0, user_model_1.findUserById)(id);
    if (!user)
        throw ApiError_1.ApiError.notFound('Customer not found');
    if (data.email !== undefined && (await (0, user_model_1.emailExists)(data.email, id))) {
        throw ApiError_1.ApiError.conflict('Another account already uses that email address');
    }
    const patch = {};
    if (data.full_name !== undefined)
        patch.full_name = data.full_name;
    if (data.email !== undefined)
        patch.email = data.email;
    if (data.phone !== undefined)
        patch.phone = data.phone;
    if (data.avatar !== undefined)
        patch.avatar = data.avatar;
    if (data.status !== undefined)
        patch.status = data.status;
    if (Object.keys(patch).length > 0)
        await (0, user_model_1.updateUser)(id, patch);
    return (0, user_model_1.findUserById)(id);
}
async function removeUser(id, actorId) {
    if (id === actorId)
        throw ApiError_1.ApiError.badRequest('You cannot delete your own account');
    const user = await (0, user_model_1.findUserById)(id);
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    if (user.role === 'admin') {
        const [admins] = await (0, database_1.query)("SELECT COUNT(*) AS total FROM users WHERE role = 'admin' AND status = 'active'");
        if (Number(admins?.total ?? 0) <= 1) {
            throw ApiError_1.ApiError.badRequest('Cannot delete the last remaining administrator');
        }
    }
    // Cascade the customer's cart/wishlist/reviews; keep their order history.
    await (0, user_model_1.deleteCustomerWithData)(id);
    return true;
}
async function setUserRole(id, role, actorId) {
    if (id === actorId && role !== 'admin') {
        throw ApiError_1.ApiError.badRequest('You cannot remove your own admin role');
    }
    const user = await (0, user_model_1.findUserById)(id);
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    await (0, user_model_1.updateUser)(id, { role });
    // A privilege change must invalidate existing sessions immediately.
    if (role !== user.role) {
        await (0, database_2.execute)('UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [id]);
    }
    return (0, user_model_1.findUserById)(id);
}
async function setUserStatus(id, status, actorId) {
    if (id === actorId && status !== 'active') {
        throw ApiError_1.ApiError.badRequest('You cannot block or deactivate your own account');
    }
    const user = await (0, user_model_1.findUserById)(id);
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    if (status !== 'active') {
        const [admins] = await (0, database_1.query)("SELECT COUNT(*) AS total FROM users WHERE role = 'admin' AND status = 'active'");
        if (user.role === 'admin' && Number(admins?.total ?? 0) <= 1) {
            throw ApiError_1.ApiError.badRequest('Cannot deactivate the last remaining administrator');
        }
        await (0, database_2.execute)('UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [id]);
    }
    await (0, user_model_1.updateUser)(id, { status });
    return (0, user_model_1.findUserById)(id);
}
async function getActivityLog(list) {
    return (0, user_model_1.listActivityLog)(list);
}
async function getCustomerOrders(id) {
    const user = await (0, user_model_1.findUserById)(id);
    if (!user)
        throw ApiError_1.ApiError.notFound('Customer not found');
    const orders = await (0, database_1.query)(`SELECT o.id, o.order_number, o.order_status, o.payment_status, o.payment_method,
            o.grand_total, o.created_at,
            (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`, [id]);
    return { customer: user, orders };
}
async function getCustomerAddresses(id) {
    return (0, user_model_1.listAddressesByUser)(id);
}
async function addCustomerAddress(userId, data) {
    const address = {
        full_name: String(data.full_name ?? ''),
        phone: String(data.phone ?? ''),
        address_line_1: String(data.address_line_1 ?? ''),
        address_line_2: data.address_line_2 ? String(data.address_line_2) : null,
        city: String(data.city ?? ''),
        province: data.province ? String(data.province) : null,
        postal_code: data.postal_code ? String(data.postal_code) : null,
        country: data.country ? String(data.country) : 'Philippines',
        is_default: data.is_default ? 1 : 0,
    };
    await (0, user_model_1.createAddress)(userId, address);
    return (0, user_model_1.listAddressesByUser)(userId);
}
async function customerCount() {
    const row = await (0, database_1.queryOne)("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'");
    return Number(row?.total ?? 0);
}
//# sourceMappingURL=user.service.js.map