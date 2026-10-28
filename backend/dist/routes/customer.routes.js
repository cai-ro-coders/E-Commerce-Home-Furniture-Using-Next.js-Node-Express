"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const rbac_1 = require("../middleware/rbac");
const auth_1 = require("../middleware/auth");
const ApiResponse_1 = require("../utils/ApiResponse");
const pagination_1 = require("../utils/pagination");
const database_1 = require("../config/database");
const user_model_1 = require("../models/user.model");
const user_service_1 = require("../services/user.service");
const ApiError_1 = require("../utils/ApiError");
const user_validator_1 = require("../validators/user.validator");
const common_validator_1 = require("../validators/common.validator");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, rbac_1.requireStaff);
/** The Customers module: the same user table, pinned to `role = 'customer'`. */
router.get('/', (0, asyncHandler_1.validate)(user_validator_1.userListQuerySchema, 'query'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const list = (0, pagination_1.parseListQuery)(req);
    list.filters.role = 'customer';
    return (0, ApiResponse_1.paginated)(res, await (0, user_model_1.listUsers)(list));
}));
/** Headline numbers for the Customers page header. */
router.get('/stats', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [row] = await (0, database_1.query)(`SELECT COUNT(*) AS total,
              SUM(status = 'active') AS active,
              SUM(status = 'blocked') AS blocked,
              SUM(created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) AS new_this_month,
              COALESCE(SUM((SELECT COALESCE(SUM(grand_total), 0) FROM orders o
                             WHERE o.user_id = u.id AND o.order_status <> 'Cancelled')), 0) AS lifetime_value
         FROM users u
        WHERE role = 'customer'`);
    return (0, ApiResponse_1.ok)(res, {
        total: Number(row?.total ?? 0),
        active: Number(row?.active ?? 0),
        blocked: Number(row?.blocked ?? 0),
        new_this_month: Number(row?.new_this_month ?? 0),
        lifetime_value: Number(row?.lifetime_value ?? 0),
    });
}));
router.get('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const customer = await (0, user_model_1.findUserById)(id);
    if (!customer || customer.role !== 'customer')
        throw ApiError_1.ApiError.notFound('Customer not found');
    const [orders, addresses, loginHistory] = await Promise.all([
        (0, user_model_1.getCustomerOrderSummary)(id, 20),
        (0, user_model_1.listAddressesByUser)(id),
        (0, user_model_1.listLoginHistory)(id, 20),
    ]);
    return (0, ApiResponse_1.ok)(res, { ...customer, orders, addresses, login_history: loginHistory });
}));
router.get('/:id/orders', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), user_controller_1.customerOrdersHandler);
router.get('/:id/addresses', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), user_controller_1.customerAddressesHandler);
router.get('/:id/login-history', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, user_model_1.listLoginHistory)(Number(req.params.id), 50));
}));
/**
 * Edit a customer from the Customers module. Role is deliberately not editable
 * here — a customer promoted to staff belongs in the Users module, so the two
 * screens cannot disagree about what an account is.
 */
router.put('/:id', rbac_1.requireAdmin, (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(user_validator_1.updateCustomerSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const customer = await (0, user_model_1.findUserById)(id);
    if (!customer || customer.role !== 'customer')
        throw ApiError_1.ApiError.notFound('Customer not found');
    const updated = await (0, user_service_1.updateCustomer)(id, req.body);
    return (0, ApiResponse_1.ok)(res, updated, 'Customer updated');
}));
router.delete('/:id', rbac_1.requireAdmin, (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const customer = await (0, user_model_1.findUserById)(id);
    if (!customer || customer.role !== 'customer')
        throw ApiError_1.ApiError.notFound('Customer not found');
    // Their orders survive with a null user_id so sales history stays intact.
    await (0, user_model_1.deleteCustomerWithData)(id);
    return (0, ApiResponse_1.noContent)(res);
}));
exports.default = router;
//# sourceMappingURL=customer.routes.js.map