"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const rbac_1 = require("../middleware/rbac");
const auth_1 = require("../middleware/auth");
const user_controller_1 = require("../controllers/user.controller");
const user_validator_1 = require("../validators/user.validator");
const common_validator_1 = require("../validators/common.validator");
const order_validator_1 = require("../validators/order.validator");
const user_model_1 = require("../models/user.model");
const router = (0, express_1.Router)();
/** Every route here is admin-only; `requireAdmin` guards the whole router. */
router.use(auth_1.authenticate, rbac_1.requireAdmin);
/** Staff may read the user table, but only an admin may change or remove anyone. */
router.get('/', rbac_1.requireStaff, (0, asyncHandler_1.validate)(user_validator_1.userListQuerySchema, 'query'), user_controller_1.listUsersHandler);
// Literal paths come before `/:id` so "stats" is not parsed as an id.
router.get('/stats', rbac_1.requireStaff, user_controller_1.usersStatsHandler);
router.get('/activity', rbac_1.requireStaff, user_controller_1.activityLogHandler);
router.get('/:id', rbac_1.requireStaff, (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), user_controller_1.getUserHandler);
router.post('/', (0, asyncHandler_1.validate)(user_validator_1.createUserSchema), user_controller_1.createUserHandler);
router.put('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(user_validator_1.updateUserSchema), user_controller_1.updateUserHandler);
router.patch('/:id/role', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(user_validator_1.changeUserRoleSchema), user_controller_1.changeRoleHandler);
router.patch('/:id/status', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(user_validator_1.changeUserStatusSchema), user_controller_1.changeStatusHandler);
router.delete('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), user_controller_1.deleteUserHandler);
// Customer sub-resources, reachable from the Customers module.
router.get('/:id/orders', rbac_1.requireStaff, (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), user_controller_1.customerOrdersHandler);
router.get('/:id/addresses', rbac_1.requireStaff, (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), user_controller_1.customerAddressesHandler);
router.post('/:id/addresses', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(order_validator_1.addressSchema), user_controller_1.createCustomerAddressHandler);
router.get('/:id/summary', rbac_1.requireStaff, (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), async (req, res, next) => {
    try {
        res.json({ success: true, data: await (0, user_model_1.getCustomerOrderSummary)(Number(req.params.id), 5) });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map