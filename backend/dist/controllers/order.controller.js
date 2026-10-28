"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookHandler = exports.cancelPayPalPaymentHandler = exports.confirmPayPalPaymentHandler = exports.confirmStripePaymentHandler = exports.checkoutHandler = exports.exportOrdersHandler = exports.orderReceiptHandler = exports.addOrderHistoryHandler = exports.orderHistoryHandler = exports.deleteOrderHandler = exports.updateOrderStatusHandler = exports.updateOrderHandler = exports.createOrderHandler = exports.getOrderHandler = exports.orderStatsHandler = exports.listOrdersHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const pagination_1 = require("../utils/pagination");
const ApiError_1 = require("../utils/ApiError");
const order_service_1 = require("../services/order.service");
function orderFilters(req) {
    const list = (0, pagination_1.parseListQuery)(req);
    const q = req.query;
    const num = (key) => q[key] === undefined || q[key] === '' ? undefined : Number(q[key]);
    return {
        ...list,
        status: q.status || undefined,
        paymentStatus: q.payment_status || undefined,
        paymentMethod: q.payment_method || undefined,
        customerId: num('customer_id'),
        from: q.from || undefined,
        to: q.to || undefined,
        minTotal: num('min_total'),
        maxTotal: num('max_total'),
    };
}
/**
 * Customers may only read their own orders; staff read everything.
 * The ownership check is a column filter, not a post-filter, so a crafted id
 * never leaks another customer's data.
 */
function scopeForCustomer(filters, req) {
    if (req.user?.role === 'admin' || req.user?.role === 'staff')
        return filters;
    return { ...filters, customerId: req.user.id };
}
exports.listOrdersHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.paginated)(res, await (0, order_service_1.getOrders)(scopeForCustomer(orderFilters(req), req)));
});
exports.orderStatsHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, order_service_1.getOrderStats)());
});
exports.getOrderHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const order = await (0, order_service_1.getOrder)(id);
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
        throw ApiError_1.ApiError.forbidden('That order does not belong to your account');
    }
    return (0, ApiResponse_1.ok)(res, order);
});
exports.createOrderHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await (0, order_service_1.createNewOrder)(req.body, req.user.id);
    return (0, ApiResponse_1.created)(res, order, 'Order created successfully');
});
exports.updateOrderHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await (0, order_service_1.updateExistingOrder)(Number(req.params.id), req.body);
    return (0, ApiResponse_1.ok)(res, order, 'Order updated successfully');
});
exports.updateOrderStatusHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const result = await (0, order_service_1.changeOrderStatus)(Number(req.params.id), body, req.user.id);
    return (0, ApiResponse_1.ok)(res, result, result.restocked > 0
        ? `Status updated. ${result.restocked} item(s) returned to stock.`
        : 'Status updated');
});
exports.deleteOrderHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, order_service_1.removeOrder)(Number(req.params.id));
    return (0, ApiResponse_1.noContent)(res);
});
exports.orderHistoryHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, ApiResponse_1.ok)(res, await (0, order_service_1.getOrderHistory)(Number(req.params.id)));
});
exports.addOrderHistoryHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const history = await (0, order_service_1.addOrderHistoryNote)(Number(req.params.id), req.body, req.user.id);
    return (0, ApiResponse_1.created)(res, history, 'Tracking note added');
});
exports.orderReceiptHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    if (req.user.role === 'customer') {
        const order = await (0, order_service_1.getOrder)(id);
        if (order.user_id !== req.user.id) {
            throw ApiError_1.ApiError.forbidden('That order does not belong to your account');
        }
    }
    return (0, ApiResponse_1.ok)(res, await (0, order_service_1.getReceipt)(id));
});
exports.exportOrdersHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const format = req.query.format === 'json' ? 'json' : 'csv';
    const file = await (0, order_service_1.exportOrders)(orderFilters(req), format);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    return res.send(file.body);
});
/** Customer checkout: converts the signed-in customer's cart into an order. */
exports.checkoutHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await (0, order_service_1.checkout)(req.user.id, req.body);
    return (0, ApiResponse_1.created)(res, order, `Order ${order.order_number} placed`);
});
/**
 * Called by the Stripe success page with the session id from the redirect. The
 * service retrieves the session from Stripe, so a forged query string cannot
 * mark an order paid.
 */
exports.confirmStripePaymentHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await (0, order_service_1.confirmStripePayment)(req.user.id, Number(req.params.id), String(req.body.session_id));
    return (0, ApiResponse_1.ok)(res, order, 'Payment confirmed');
});
/**
 * Called by the PayPal return page with the `token` PayPal appended to the
 * return URL. The order is captured and matched before it is marked paid.
 */
exports.confirmPayPalPaymentHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await (0, order_service_1.confirmPayPalPayment)(req.user.id, Number(req.params.id), String(req.body.paypal_order_id));
    return (0, ApiResponse_1.ok)(res, order, 'Payment confirmed');
});
/** Called when the customer closes PayPal's approval page without paying. */
exports.cancelPayPalPaymentHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await (0, order_service_1.cancelPayPalPayment)(req.user.id, Number(req.params.id));
    return (0, ApiResponse_1.ok)(res, order, 'PayPal checkout cancelled');
});
/**
 * Stripe webhook. Mounted directly on the app (before the JSON parser) because
 * signature verification needs the raw request body, and Stripe cannot send a
 * CSRF token or session cookie.
 */
exports.stripeWebhookHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const signature = req.headers['stripe-signature'];
    await (0, order_service_1.handleStripeWebhook)(req.body, Array.isArray(signature) ? signature[0] : signature);
    return (0, ApiResponse_1.ok)(res, { received: true });
});
//# sourceMappingURL=order.controller.js.map