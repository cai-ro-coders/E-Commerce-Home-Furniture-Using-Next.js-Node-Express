"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddressHandler = exports.updateAddressHandler = exports.createAddressHandler = exports.listAddressesHandler = exports.createCustomerAddressHandler = exports.customerAddressesHandler = exports.customerOrdersHandler = exports.activityLogHandler = exports.changeStatusHandler = exports.changeRoleHandler = exports.deleteUserHandler = exports.updateUserHandler = exports.createUserHandler = exports.getUserHandler = exports.listUsersHandler = exports.usersStatsHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const pagination_1 = require("../utils/pagination");
const user_service_1 = require("../services/user.service");
const user_model_1 = require("../models/user.model");
const ApiError_1 = require("../utils/ApiError");
/** Header counters for the Users module: totals by role and by status. */
exports.usersStatsHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, user_service_1.getUserStats)());
});
exports.listUsersHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, user_service_1.getUsers)((0, pagination_1.parseListQuery)(req));
    return (0, ApiResponse_1.paginated)(res, result);
});
exports.getUserHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await (0, user_service_1.getUserById)(req.params.id);
    return (0, ApiResponse_1.ok)(res, user);
});
exports.createUserHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await (0, user_service_1.createNewUser)(req.body);
    return (0, ApiResponse_1.created)(res, user, 'User created successfully');
});
exports.updateUserHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await (0, user_service_1.updateNewUser)(req.params.id, req.body, req.user.id);
    return (0, ApiResponse_1.ok)(res, user, 'User updated successfully');
});
exports.deleteUserHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, user_service_1.removeUser)(req.params.id, req.user.id);
    return (0, ApiResponse_1.noContent)(res);
});
exports.changeRoleHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await (0, user_service_1.setUserRole)(req.params.id, req.body.role, req.user.id);
    return (0, ApiResponse_1.ok)(res, user, 'Role updated successfully');
});
exports.changeStatusHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await (0, user_service_1.setUserStatus)(req.params.id, req.body.status, req.user.id);
    return (0, ApiResponse_1.ok)(res, user, 'Status updated successfully');
});
exports.activityLogHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, user_service_1.getActivityLog)((0, pagination_1.parseListQuery)(req));
    return (0, ApiResponse_1.paginated)(res, result);
});
// ---------------------------------------------------------------- customers
exports.customerOrdersHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, user_service_1.getCustomerOrders)(req.params.id);
    return (0, ApiResponse_1.ok)(res, data);
});
exports.customerAddressesHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const addresses = await (0, user_service_1.getCustomerAddresses)(req.params.id);
    return (0, ApiResponse_1.ok)(res, addresses);
});
exports.createCustomerAddressHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const addresses = await (0, user_service_1.addCustomerAddress)(req.params.id, req.body);
    return (0, ApiResponse_1.created)(res, addresses, 'Address saved');
});
exports.listAddressesHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const addresses = await (0, user_model_1.listAddressesByUser)(req.user.id);
    return (0, ApiResponse_1.ok)(res, addresses);
});
exports.createAddressHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const address = {
        full_name: String(body.full_name ?? ''),
        phone: String(body.phone ?? ''),
        address_line_1: String(body.address_line_1 ?? ''),
        address_line_2: body.address_line_2 ? String(body.address_line_2) : null,
        city: String(body.city ?? ''),
        province: body.province ? String(body.province) : null,
        postal_code: body.postal_code ? String(body.postal_code) : null,
        country: body.country ? String(body.country) : 'Philippines',
        is_default: body.is_default ? 1 : 0,
    };
    await (0, user_model_1.createAddress)(req.user.id, address);
    const addresses = await (0, user_model_1.listAddressesByUser)(req.user.id);
    return (0, ApiResponse_1.created)(res, addresses, 'Address saved');
});
/** Load an address and assert it belongs to the signed-in customer. */
async function ownAddress(id, userId) {
    const address = await (0, user_model_1.findAddressById)(id);
    if (!address)
        throw ApiError_1.ApiError.notFound('Address not found');
    if (address.user_id !== userId)
        throw ApiError_1.ApiError.forbidden('Not your address');
    return address;
}
exports.updateAddressHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const address = await ownAddress(req.params.id, req.user.id);
    const body = req.body;
    const patch = {};
    if (body.full_name !== undefined)
        patch.full_name = String(body.full_name);
    if (body.phone !== undefined)
        patch.phone = String(body.phone);
    if (body.address_line_1 !== undefined)
        patch.address_line_1 = String(body.address_line_1);
    if (body.address_line_2 !== undefined) {
        patch.address_line_2 = body.address_line_2 === null ? null : String(body.address_line_2);
    }
    if (body.city !== undefined)
        patch.city = String(body.city);
    if (body.province !== undefined) {
        patch.province = body.province === null ? null : String(body.province);
    }
    if (body.postal_code !== undefined) {
        patch.postal_code = body.postal_code === null ? null : String(body.postal_code);
    }
    if (body.country !== undefined)
        patch.country = String(body.country);
    if (body.is_default !== undefined)
        patch.is_default = body.is_default ? 1 : 0;
    await (0, user_model_1.updateAddress)(address.id, patch);
    const addresses = await (0, user_model_1.listAddressesByUser)(req.user.id);
    return (0, ApiResponse_1.ok)(res, addresses, 'Address updated');
});
exports.deleteAddressHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const address = await ownAddress(req.params.id, req.user.id);
    await (0, user_model_1.deleteAddress)(address.id);
    return (0, ApiResponse_1.noContent)(res);
});
//# sourceMappingURL=user.controller.js.map