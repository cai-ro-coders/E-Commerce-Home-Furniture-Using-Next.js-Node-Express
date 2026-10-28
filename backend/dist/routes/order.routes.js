"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const order_controller_1 = require("../controllers/order.controller");
const order_validator_1 = require("../validators/order.validator");
const common_validator_1 = require("../validators/common.validator");
const router = (0, express_1.Router)();
// A customer may list their own orders; `listOrdersHandler` narrows the query
// by user id for anyone who is not staff.
router.use(auth_1.authenticate);
// Literal paths are declared before `/:id` so `stats` and `export` are not
// swallowed by the id parameter (which would 422 on a non-numeric value).
router.get('/', (0, asyncHandler_1.validate)(order_validator_1.orderListQuerySchema, 'query'), order_controller_1.listOrdersHandler);
// Stats and exports are store-wide, so they are staff-only.
router.get('/stats', rbac_1.requireStaff, order_controller_1.orderStatsHandler);
router.get('/export', rbac_1.requireStaff, order_controller_1.exportOrdersHandler);
router.get('/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), order_controller_1.getOrderHandler);
router.get('/:id/history', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), order_controller_1.orderHistoryHandler);
router.get('/:id/receipt', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), order_controller_1.orderReceiptHandler);
/** Customer checkout: turns the signed-in customer's basket into an order. */
router.post('/checkout', (0, asyncHandler_1.validate)(order_validator_1.checkoutSchema), order_controller_1.checkoutHandler);
/** Stripe success page settles the order after retrieving the session. */
router.post('/:id/stripe/confirm', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(order_validator_1.confirmStripePaymentSchema), order_controller_1.confirmStripePaymentHandler);
/** PayPal return page captures the approved order before settling it. */
router.post('/:id/paypal/confirm', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(order_validator_1.confirmPayPalPaymentSchema), order_controller_1.confirmPayPalPaymentHandler);
/** PayPal cancel page releases the stock held by the pending order. */
router.post('/:id/paypal/cancel', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), order_controller_1.cancelPayPalPaymentHandler);
router.post('/', rbac_1.requireStaff, (0, asyncHandler_1.validate)(order_validator_1.createOrderSchema), order_controller_1.createOrderHandler);
router.put('/:id', rbac_1.requireStaff, (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(order_validator_1.updateOrderSchema), order_controller_1.updateOrderHandler);
router.patch('/:id/status', rbac_1.requireStaff, (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(order_validator_1.updateOrderStatusSchema), order_controller_1.updateOrderStatusHandler);
router.post('/:id/history', rbac_1.requireStaff, (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(order_validator_1.orderStatusHistorySchema), order_controller_1.addOrderHistoryHandler);
router.delete('/:id', rbac_1.requireStaff, (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), order_controller_1.deleteOrderHandler);
exports.default = router;
//# sourceMappingURL=order.routes.js.map