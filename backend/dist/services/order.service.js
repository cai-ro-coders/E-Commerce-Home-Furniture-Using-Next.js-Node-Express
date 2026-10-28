"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = getOrders;
exports.getOrder = getOrder;
exports.getOrderStats = getOrderStats;
exports.createNewOrder = createNewOrder;
exports.updateExistingOrder = updateExistingOrder;
exports.changeOrderStatus = changeOrderStatus;
exports.removeOrder = removeOrder;
exports.getOrderHistory = getOrderHistory;
exports.addOrderHistoryNote = addOrderHistoryNote;
exports.exportOrders = exportOrders;
exports.checkout = checkout;
exports.confirmStripePayment = confirmStripePayment;
exports.confirmPayPalPayment = confirmPayPalPayment;
exports.cancelPayPalPayment = cancelPayPalPayment;
exports.handleStripeWebhook = handleStripeWebhook;
exports.getReceipt = getReceipt;
const database_1 = require("../config/database");
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../utils/logger");
const csv_1 = require("../utils/csv");
const order_model_1 = require("../models/order.model");
const notification_model_1 = require("../models/notification.model");
const setting_model_1 = require("../models/setting.model");
const cart_model_1 = require("../models/cart.model");
const database_2 = require("../config/database");
const env_1 = require("../config/env");
const stripe_1 = require("../config/stripe");
const paypal_1 = require("../config/paypal");
const paypal_server_sdk_1 = require("@paypal/paypal-server-sdk");
/**
 * The controller speaks camelCase, while the model filters mirror the DB
 * columns (snake_case). Translate at this boundary so filters such as the
 * customer scope are not silently dropped.
 */
function toModelFilters(filters) {
    return {
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
        filters: filters.filters,
        status: filters.status,
        payment_status: filters.paymentStatus,
        payment_method: filters.paymentMethod,
        customer_id: filters.customerId,
        from: filters.from,
        to: filters.to,
        min_total: filters.minTotal,
        max_total: filters.maxTotal,
    };
}
async function getOrders(filters) {
    return (0, order_model_1.listOrders)(toModelFilters(filters));
}
async function getOrder(id) {
    const order = await (0, order_model_1.findOrderById)(id);
    if (!order)
        throw ApiError_1.ApiError.notFound('Order not found');
    const [items, history, payment] = await Promise.all([
        (0, order_model_1.listOrderItems)(id),
        (0, order_model_1.listOrderStatusHistory)(id),
        (0, order_model_1.findPaymentByOrder)(id),
    ]);
    let address = null;
    if (order.shipping_address_id) {
        address = await (0, database_1.queryOne)('SELECT * FROM addresses WHERE id = ? LIMIT 1', [order.shipping_address_id]);
    }
    return { ...order, items, history, payment, shipping_address: address };
}
async function getOrderStats() {
    return (0, order_model_1.orderStats)();
}
async function createNewOrder(data, actorId) {
    const items = data.items ?? [];
    if (items.length === 0)
        throw ApiError_1.ApiError.badRequest('An order needs at least one item');
    const orderId = await (0, order_model_1.createOrder)({
        userId: data.user_id ? Number(data.user_id) : null,
        shippingAddressId: data.shipping_address_id ? Number(data.shipping_address_id) : null,
        items,
        paymentMethod: data.payment_method ?? 'cod',
        paymentStatus: data.payment_status ?? 'Pending',
        orderStatus: data.order_status ?? 'Pending',
        couponCode: data.coupon_code ?? null,
        notes: data.notes ?? null,
        shippingFeeOverride: data.shipping_fee === undefined ? null : Number(data.shipping_fee),
        taxOverride: data.tax === undefined ? null : Number(data.tax),
        createdBy: actorId,
    });
    const order = await getOrder(orderId);
    await (0, notification_model_1.notifyStaff)({
        title: 'New order received',
        message: `Order ${order.order_number} was placed for ${order.grand_total}.`,
        type: 'success',
        link: `/admin/orders/${orderId}`,
    });
    if (order.user_id) {
        await (0, notification_model_1.createNotification)({
            user_id: order.user_id,
            title: 'Order confirmed',
            message: `We received your order ${order.order_number}.`,
            type: 'success',
            link: `/account/orders`,
        });
    }
    return order;
}
async function updateExistingOrder(id, data) {
    const existing = await (0, order_model_1.findOrderById)(id);
    if (!existing)
        throw ApiError_1.ApiError.notFound('Order not found');
    const patch = {};
    if (data.order_status !== undefined)
        patch.order_status = data.order_status;
    if (data.payment_status !== undefined)
        patch.payment_status = data.payment_status;
    if (data.payment_method !== undefined)
        patch.payment_method = data.payment_method;
    if (data.shipping_address_id !== undefined) {
        patch.shipping_address_id = data.shipping_address_id
            ? Number(data.shipping_address_id)
            : null;
    }
    if (data.notes !== undefined)
        patch.notes = data.notes === null ? null : String(data.notes);
    if (data.shipping_fee !== undefined)
        patch.shipping_fee = Number(data.shipping_fee);
    if (data.tax !== undefined)
        patch.tax = Number(data.tax);
    if (data.discount !== undefined)
        patch.discount = Number(data.discount);
    await (0, order_model_1.updateOrder)(id, patch);
    return getOrder(id);
}
async function changeOrderStatus(id, data, actorId) {
    const existing = await (0, order_model_1.findOrderById)(id);
    if (!existing)
        throw ApiError_1.ApiError.notFound('Order not found');
    let restocked = 0;
    try {
        const result = await (0, order_model_1.updateOrderStatus)({
            orderId: id,
            orderStatus: data.order_status,
            paymentStatus: data.payment_status,
            note: data.note,
            userId: actorId,
        });
        restocked = result.restocked;
    }
    catch (error) {
        if (error instanceof Error && error.message === 'ORDER_NOT_FOUND') {
            throw ApiError_1.ApiError.notFound('Order not found');
        }
        throw error;
    }
    const order = await getOrder(id);
    if (existing.user_id) {
        await (0, notification_model_1.createNotification)({
            user_id: existing.user_id,
            title: `Order ${data.order_status}`,
            message: `Your order ${order.order_number} is now ${data.order_status.toLowerCase()}.`,
            type: data.order_status === 'Cancelled' ? 'warning' : 'info',
            link: '/account/orders',
        });
    }
    return { order, restocked };
}
async function removeOrder(id) {
    const order = await (0, order_model_1.findOrderById)(id);
    if (!order)
        throw ApiError_1.ApiError.notFound('Order not found');
    await (0, order_model_1.deleteOrder)(id);
    return true;
}
async function getOrderHistory(id) {
    const order = await (0, order_model_1.findOrderById)(id);
    if (!order)
        throw ApiError_1.ApiError.notFound('Order not found');
    return (0, order_model_1.listOrderStatusHistory)(id);
}
async function addOrderHistoryNote(id, data, actorId) {
    const order = await (0, order_model_1.findOrderById)(id);
    if (!order)
        throw ApiError_1.ApiError.notFound('Order not found');
    await (0, database_1.query)('INSERT INTO order_status_history (order_id, status, note, created_by) VALUES (?, ?, ?, ?)', [
        id,
        data.status,
        data.note ?? 'Status update',
        actorId,
    ]);
    return (0, order_model_1.listOrderStatusHistory)(id);
}
async function exportOrders(filters, format) {
    const rows = await (0, order_model_1.allOrders)(toModelFilters(filters));
    if (format === 'json') {
        return {
            body: JSON.stringify(rows, null, 2),
            mimeType: 'application/json',
            filename: `orders-export-${Date.now()}.json`,
        };
    }
    const csv = (0, csv_1.toCsv)(rows, [
        { key: 'id', header: 'ID' },
        { key: 'order_number', header: 'Order Number' },
        { key: 'customer_name', header: 'Customer', map: (row) => row.customer_name ?? 'Guest' },
        { key: 'customer_email', header: 'Email', map: (row) => row.customer_email ?? '' },
        { key: 'created_at', header: 'Date' },
        { key: 'item_count', header: 'Items' },
        { key: 'subtotal', header: 'Subtotal' },
        { key: 'discount', header: 'Discount' },
        { key: 'shipping_fee', header: 'Shipping' },
        { key: 'tax', header: 'Tax' },
        { key: 'grand_total', header: 'Total' },
        { key: 'payment_method', header: 'Payment Method' },
        { key: 'payment_status', header: 'Payment Status' },
        { key: 'order_status', header: 'Fulfilment' },
        { key: 'city', header: 'City', map: (row) => row.city ?? '' },
        { key: 'province', header: 'Province', map: (row) => row.province ?? '' },
    ]);
    return { body: csv, mimeType: 'text/csv; charset=utf-8', filename: `orders-export-${Date.now()}.csv` };
}
/**
 * Create the Stripe Checkout Session for an order that has already been
 * committed.
 *
 * The session charges the order's stored `grand_total` — the same number the
 * database computed from live prices, coupon, tax and shipping — so the quote
 * and the charge cannot drift apart.
 */
async function createStripeSession(userId, order, currency) {
    const stripe = await (0, stripe_1.getStripeClient)();
    const [items, customer] = await Promise.all([
        (0, order_model_1.listOrderItems)(order.id),
        (0, database_1.queryOne)('SELECT email FROM users WHERE id = ? LIMIT 1', [
            userId,
        ]),
    ]);
    const amount = Math.round(Number(order.grand_total) * 100);
    if (!Number.isFinite(amount) || amount < 1)
        throw new Error('INVALID_ORDER_AMOUNT');
    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        // This Stripe API version uses dynamic payment methods; `allowed_...`
        // filters the offered list down to cards.
        allowed_payment_method_types: ['card'],
        client_reference_id: String(order.id),
        customer_email: customer?.email,
        metadata: {
            order_id: String(order.id),
            order_number: order.order_number,
            user_id: String(userId),
        },
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: currency.toLowerCase(),
                    unit_amount: amount,
                    product_data: {
                        name: `Order ${order.order_number}`,
                        description: `${items.length} item${items.length === 1 ? '' : 's'} from ${order.customer_name ?? 'our store'}`,
                    },
                },
            },
        ],
        success_url: `${env_1.env.appUrl}/checkout/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env_1.env.appUrl}/checkout?stripe=cancelled&order=${order.id}`,
    });
    await (0, order_model_1.setPaymentTransaction)(order.id, session.id);
    return { session_id: session.id, checkout_url: session.url };
}
/**
 * Create a PayPal Orders v2 order and return the URL that sends the customer to
 * PayPal's approval page.
 *
 * The amount uses the order's stored `grand_total`, exactly like the Stripe
 * session, so the quote and the charge cannot drift apart. The order id is
 * written to both `custom_id` and the invoice reference; the capture handler
 * checks them before marking anything paid.
 */
async function createPayPalApproval(order, currency) {
    const client = await (0, paypal_1.getPayPalClient)();
    const orders = new paypal_server_sdk_1.OrdersController(client);
    const settings = await (0, setting_model_1.settingsMap)();
    const amount = Number(order.grand_total);
    if (!Number.isFinite(amount) || amount < 0.01)
        throw new Error('INVALID_ORDER_AMOUNT');
    const response = await orders.createOrder({
        body: {
            intent: paypal_server_sdk_1.CheckoutPaymentIntent.Capture,
            purchaseUnits: [
                {
                    referenceId: String(order.id),
                    customId: String(order.id),
                    invoiceId: order.order_number,
                    description: `Order ${order.order_number}`,
                    amount: {
                        currencyCode: currency.toUpperCase(),
                        value: amount.toFixed(2),
                    },
                },
            ],
            paymentSource: {
                paypal: {
                    experienceContext: {
                        brandName: settings.site_name ?? 'Lumera Home',
                        returnUrl: `${env_1.env.appUrl}/checkout/success?order=${order.id}&provider=paypal`,
                        cancelUrl: `${env_1.env.appUrl}/checkout?paypal=cancelled&order=${order.id}`,
                        userAction: paypal_server_sdk_1.PaypalExperienceUserAction.PayNow,
                        paymentMethodPreference: paypal_server_sdk_1.PayeePaymentMethodPreference.ImmediatePaymentRequired,
                        // Shipping is collected in our own checkout, so PayPal should not
                        // ask the buyer for a second address and change the quote.
                        shippingPreference: paypal_server_sdk_1.PaypalWalletContextShippingPreference.NoShipping,
                    },
                },
            },
        },
        prefer: 'return=representation',
        paypalRequestId: `checkout-${order.id}-${Date.now()}`,
    });
    const paypalOrder = response.result;
    const approvalUrl = paypalOrder.links?.find((link) => link.rel === 'payer-action' || link.rel === 'approve')?.href;
    if (!paypalOrder.id || !approvalUrl) {
        throw new Error('PAYPAL_APPROVAL_URL_MISSING');
    }
    await (0, order_model_1.setPaymentTransaction)(order.id, paypalOrder.id);
    return { paypal_order_id: paypalOrder.id, approval_url: approvalUrl };
}
/** Notify staff and the customer once an order's payment has settled. */
async function notifyPaymentReceived(orderId) {
    const order = await getOrder(orderId);
    await (0, notification_model_1.notifyStaff)({
        title: 'Payment received',
        message: `Order ${order.order_number} was paid (${order.grand_total}).`,
        type: 'success',
        link: `/admin/orders/${orderId}`,
    });
    if (order.user_id) {
        await (0, notification_model_1.createNotification)({
            user_id: order.user_id,
            title: 'Payment confirmed',
            message: `We received your payment for order ${order.order_number}.`,
            type: 'success',
            link: '/account/orders',
        });
    }
}
/**
 * Customer-facing checkout: turn the current cart into an order, then empty the
 * cart. The cart clear happens after the order commits so a failure never
 * destroys the customer's basket.
 *
 * Card payments differ: the order is created first (reserving stock), then the
 * customer is sent to Stripe's hosted checkout. The cart is only cleared once
 * Stripe confirms the charge, so abandoning the Stripe page leaves the basket
 * intact for a retry.
 */
async function checkout(userId, data) {
    const address = await (0, database_1.queryOne)('SELECT id, user_id FROM addresses WHERE id = ? LIMIT 1', [data.shipping_address_id]);
    if (!address)
        throw ApiError_1.ApiError.notFound('Shipping address not found');
    if (Number(address.user_id) !== userId) {
        throw ApiError_1.ApiError.forbidden('That shipping address does not belong to your account');
    }
    // Fall back to the persisted cart when the client does not send items.
    let items = data.items ?? [];
    if (items.length === 0) {
        const cartRows = await (0, database_1.query)(`SELECT ci.product_id, ci.quantity
         FROM cart_items ci
         JOIN carts c ON c.id = ci.cart_id
        WHERE c.user_id = ?`, [userId]);
        items = cartRows.map((row) => ({ product_id: row.product_id, quantity: row.quantity }));
    }
    if (items.length === 0)
        throw ApiError_1.ApiError.badRequest('Your cart is empty');
    const settings = await (0, setting_model_1.settingsMap)();
    const currency = settings.currency ?? 'PHP';
    const isStripe = data.payment_method === 'stripe';
    const isPayPal = data.payment_method === 'paypal';
    // Gateway payments hold stock while the customer is away approving the
    // charge, so the basket is only cleared once that charge is confirmed.
    const isRedirectPayment = isStripe || isPayPal;
    if (isStripe && !(await (0, stripe_1.isStripeConfigured)())) {
        throw ApiError_1.ApiError.badRequest('Card payments are not available yet. Add your Stripe keys in Admin → Settings → Payment gateways.');
    }
    if (isPayPal && !(await (0, paypal_1.isPayPalConfigured)())) {
        throw ApiError_1.ApiError.badRequest('PayPal is not available yet. Add your PayPal credentials in Admin → Settings → Payment gateways.');
    }
    const orderId = await (0, order_model_1.createOrder)({
        userId,
        shippingAddressId: data.shipping_address_id,
        items,
        paymentMethod: data.payment_method,
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        couponCode: data.coupon_code ?? null,
        notes: data.notes ?? null,
        currency,
        createdBy: userId,
    });
    if (!isRedirectPayment) {
        await (0, database_2.transaction)((connection) => (0, cart_model_1.clearCartWithConnection)(connection, userId));
    }
    const order = await getOrder(orderId);
    if (isStripe) {
        try {
            const stripe = await createStripeSession(userId, order, currency);
            return { ...order, currency, stripe };
        }
        catch (error) {
            // Never leave an unpaid order holding stock when Stripe could not be
            // reached; cancelling restocks every line item.
            await (0, order_model_1.updateOrderStatus)({
                orderId,
                orderStatus: 'Cancelled',
                note: 'Stripe checkout could not be started',
                userId,
            });
            if (error instanceof Error && error.message === 'INVALID_ORDER_AMOUNT') {
                throw ApiError_1.ApiError.badRequest('This order total is not valid for card payment');
            }
            throw ApiError_1.ApiError.badRequest('Could not start the card payment. Please try again or choose another payment method.');
        }
    }
    if (isPayPal) {
        try {
            const paypal = await createPayPalApproval(order, currency);
            return { ...order, currency, paypal };
        }
        catch (error) {
            logger_1.logger.error(`PayPal order creation failed for order ${orderId}`, error instanceof Error ? error.message : error);
            // The PayPal order may already exist even if we could not read its
            // approval link. It will expire on PayPal's side; release our stock.
            await (0, order_model_1.updateOrderStatus)({
                orderId,
                orderStatus: 'Cancelled',
                note: 'PayPal checkout could not be started',
                userId,
            });
            if (error instanceof Error && error.message === 'INVALID_ORDER_AMOUNT') {
                throw ApiError_1.ApiError.badRequest('This order total is not valid for PayPal');
            }
            throw ApiError_1.ApiError.badRequest('Could not start the PayPal payment. Please try again or choose another payment method.');
        }
    }
    await (0, notification_model_1.notifyStaff)({
        title: 'New order received',
        message: `${order.customer_name ?? 'A customer'} placed order ${order.order_number} (${order.grand_total}).`,
        type: 'success',
        link: `/admin/orders/${orderId}`,
    });
    return { ...order, currency };
}
/**
 * Settle a Stripe order from the success page.
 *
 * The session is retrieved from Stripe and matched to the order before
 * anything is marked paid — the `session_id` in the query string is never
 * trusted on its own. This also makes local development work without a webhook
 * tunnel (`stripe listen`).
 */
async function confirmStripePayment(userId, orderId, sessionId) {
    const order = await (0, order_model_1.findOrderById)(orderId);
    if (!order)
        throw ApiError_1.ApiError.notFound('Order not found');
    if (order.user_id !== userId) {
        throw ApiError_1.ApiError.forbidden('That order does not belong to your account');
    }
    if (order.payment_method !== 'stripe') {
        throw ApiError_1.ApiError.badRequest('That order was not paid by card');
    }
    if (order.payment_status !== 'Paid') {
        if (!sessionId)
            throw ApiError_1.ApiError.badRequest('Missing Stripe checkout session');
        const stripe = await (0, stripe_1.getStripeClient)();
        let session;
        try {
            session = await stripe.checkout.sessions.retrieve(sessionId);
        }
        catch {
            throw ApiError_1.ApiError.badRequest('Could not verify the Stripe payment');
        }
        const belongsToOrder = String(session.metadata?.order_id ?? '') === String(orderId) ||
            String(session.client_reference_id ?? '') === String(orderId);
        if (!belongsToOrder) {
            throw ApiError_1.ApiError.badRequest('That payment session does not belong to this order');
        }
        if (session.payment_status !== 'paid') {
            throw ApiError_1.ApiError.badRequest('The card payment has not been completed yet');
        }
        const newlyPaid = await (0, order_model_1.markOrderPaid)(orderId, String(session.payment_intent ?? session.id), 'Stripe payment received');
        if (newlyPaid)
            await notifyPaymentReceived(orderId);
    }
    // Payment is settled, so the basket has served its purpose.
    await (0, cart_model_1.clearCart)(userId);
    return getOrder(orderId);
}
/**
 * Settle a PayPal order from the return page.
 *
 * The PayPal order id comes back as `token` in the return URL. It is never
 * trusted on its own: it must match the id stored on the payment row, and the
 * capture response must carry this order's id, currency and total before
 * anything is marked paid.
 */
async function confirmPayPalPayment(userId, orderId, paypalOrderId) {
    const order = await (0, order_model_1.findOrderById)(orderId);
    if (!order)
        throw ApiError_1.ApiError.notFound('Order not found');
    if (order.user_id !== userId) {
        throw ApiError_1.ApiError.forbidden('That order does not belong to your account');
    }
    if (order.payment_method !== 'paypal') {
        throw ApiError_1.ApiError.badRequest('That order was not paid with PayPal');
    }
    if (order.payment_status !== 'Paid') {
        if (order.order_status === 'Cancelled') {
            throw ApiError_1.ApiError.badRequest('This order was cancelled before the PayPal payment completed');
        }
        if (!paypalOrderId)
            throw ApiError_1.ApiError.badRequest('Missing PayPal order id');
        const payment = await (0, order_model_1.findPaymentByOrder)(orderId);
        if (payment?.transaction_id && payment.transaction_id !== paypalOrderId) {
            throw ApiError_1.ApiError.badRequest('That PayPal payment does not belong to this order');
        }
        const settings = await (0, setting_model_1.settingsMap)();
        const currency = (payment?.currency ?? settings.currency ?? 'PHP').toUpperCase();
        const orders = new paypal_server_sdk_1.OrdersController(await (0, paypal_1.getPayPalClient)());
        let captured;
        try {
            captured = (await orders.captureOrder({
                id: paypalOrderId,
                prefer: 'return=representation',
                paypalRequestId: `capture-${orderId}`,
            })).result;
        }
        catch (error) {
            logger_1.logger.error(`PayPal capture failed for order ${orderId}`, error instanceof Error ? error.message : error);
            // A page refresh can hit an order that was already captured. Read it
            // back so the confirmation stays idempotent instead of failing.
            try {
                captured = (await orders.getOrder({ id: paypalOrderId })).result;
            }
            catch {
                throw ApiError_1.ApiError.badRequest('Could not verify the PayPal payment');
            }
        }
        const unit = captured.purchaseUnits?.[0];
        const capture = unit?.payments?.captures?.[0];
        const capturedValue = Number(capture?.amount?.value ?? Number.NaN);
        const capturedCurrency = capture?.amount?.currencyCode?.toUpperCase();
        if (captured.status !== paypal_server_sdk_1.OrderStatus.Completed ||
            capture?.status !== paypal_server_sdk_1.CaptureStatus.Completed ||
            !Number.isFinite(capturedValue) ||
            Math.abs(capturedValue - Number(order.grand_total)) > 0.009 ||
            (capturedCurrency && capturedCurrency !== currency)) {
            throw ApiError_1.ApiError.badRequest('The PayPal payment has not been completed for this order');
        }
        // `custom_id` is set to our order id when the PayPal order is created; a
        // mismatched value means the token belongs to a different checkout.
        if (unit?.customId && unit.customId !== String(orderId)) {
            throw ApiError_1.ApiError.badRequest('That PayPal payment does not belong to this order');
        }
        const newlyPaid = await (0, order_model_1.markOrderPaid)(orderId, String(capture.id ?? paypalOrderId), 'PayPal payment received');
        if (newlyPaid)
            await notifyPaymentReceived(orderId);
    }
    // Payment is settled, so the basket has served its purpose.
    await (0, cart_model_1.clearCart)(userId);
    return getOrder(orderId);
}
/**
 * Release the stock held by a PayPal order the customer abandoned.
 *
 * PayPal orders expire on their own; there is no cancel API for an unapproved
 * order, so only our pending order and its reserved stock need cleaning up.
 */
async function cancelPayPalPayment(userId, orderId) {
    const order = await (0, order_model_1.findOrderById)(orderId);
    if (!order)
        throw ApiError_1.ApiError.notFound('Order not found');
    if (order.user_id !== userId) {
        throw ApiError_1.ApiError.forbidden('That order does not belong to your account');
    }
    if (order.payment_method !== 'paypal') {
        throw ApiError_1.ApiError.badRequest('That order was not paid with PayPal');
    }
    if (order.payment_status === 'Pending' && order.order_status !== 'Cancelled') {
        await (0, order_model_1.updateOrderStatus)({
            orderId,
            orderStatus: 'Cancelled',
            note: 'PayPal checkout was cancelled',
            userId,
        });
    }
    return getOrder(orderId);
}
/**
 * Stripe webhook for asynchronous confirmation and for releasing stock when a
 * checkout session expires. Configure it in the Stripe dashboard (or via
 * `stripe listen`) as `${API_URL}/api/orders/stripe/webhook`.
 */
async function handleStripeWebhook(rawBody, signature) {
    const secret = (0, stripe_1.stripeWebhookSecret)();
    if (!secret) {
        throw ApiError_1.ApiError.badRequest('Stripe webhooks are not configured (STRIPE_WEBHOOK_SECRET is empty)');
    }
    const stripe = await (0, stripe_1.getStripeClient)();
    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, signature ?? '', secret);
    }
    catch {
        throw ApiError_1.ApiError.badRequest('Invalid Stripe webhook signature');
    }
    if (event.type === 'checkout.session.completed' ||
        event.type === 'checkout.session.async_payment_succeeded') {
        const session = event.data.object;
        const orderId = Number(session.metadata?.order_id ?? session.client_reference_id);
        if (orderId && session.payment_status === 'paid') {
            const newlyPaid = await (0, order_model_1.markOrderPaid)(orderId, String(session.payment_intent ?? session.id), 'Stripe payment received (webhook)');
            if (newlyPaid) {
                const order = await (0, order_model_1.findOrderById)(orderId);
                if (order?.user_id)
                    await (0, cart_model_1.clearCart)(order.user_id);
                await notifyPaymentReceived(orderId);
            }
        }
    }
    if (event.type === 'checkout.session.expired') {
        const session = event.data.object;
        const orderId = Number(session.metadata?.order_id ?? session.client_reference_id);
        const order = orderId ? await (0, order_model_1.findOrderById)(orderId) : null;
        if (order && order.payment_status === 'Pending' && order.order_status !== 'Cancelled') {
            // The customer never paid: release the stock the order was holding.
            await (0, order_model_1.updateOrderStatus)({
                orderId: order.id,
                orderStatus: 'Cancelled',
                note: 'Stripe checkout expired',
                userId: null,
            });
        }
    }
    return true;
}
/** Printable receipt payload — the frontend renders this in a print window. */
async function getReceipt(id) {
    const order = await getOrder(id);
    const settings = await (0, setting_model_1.settingsMap)();
    return {
        order,
        store: {
            site_name: settings.site_name ?? 'Lumera Home',
            support_email: settings.support_email ?? '',
            support_phone: settings.support_phone ?? '',
            currency: settings.currency ?? 'PHP',
            site_logo: settings.site_logo ?? '',
        },
        printed_at: new Date().toISOString(),
    };
}
//# sourceMappingURL=order.service.js.map