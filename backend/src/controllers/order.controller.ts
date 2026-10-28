import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok, paginated } from '../utils/ApiResponse';
import { parseListQuery } from '../utils/pagination';
import { ApiError } from '../utils/ApiError';
import {
  addOrderHistoryNote,
  cancelPayPalPayment,
  changeOrderStatus,
  checkout,
  confirmPayPalPayment,
  confirmStripePayment,
  createNewOrder,
  exportOrders,
  getOrder,
  getOrderHistory,
  getOrderStats,
  getOrders,
  getReceipt,
  handleStripeWebhook,
  removeOrder,
  updateExistingOrder,
  type OrderFiltersInput,
} from '../services/order.service';
import type { OrderStatus, PaymentMethod, PaymentStatus } from '../types';

function orderFilters(req: Request): OrderFiltersInput {
  const list = parseListQuery(req);
  const q = req.query as Record<string, string | undefined>;
  const num = (key: string): number | undefined =>
    q[key] === undefined || q[key] === '' ? undefined : Number(q[key]);

  return {
    ...list,
    status: (q.status as OrderStatus | undefined) || undefined,
    paymentStatus: (q.payment_status as PaymentStatus | undefined) || undefined,
    paymentMethod: (q.payment_method as PaymentMethod | undefined) || undefined,
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
function scopeForCustomer(filters: OrderFiltersInput, req: Request) {
  if (req.user?.role === 'admin' || req.user?.role === 'staff') return filters;
  return { ...filters, customerId: req.user!.id };
}

export const listOrdersHandler = asyncHandler(async (req: Request, res: Response) => {
  return paginated(res, await getOrders(scopeForCustomer(orderFilters(req), req)));
});

export const orderStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await getOrderStats());
});

export const getOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const order = await getOrder(id);
  if (req.user!.role === 'customer' && order.user_id !== req.user!.id) {
    throw ApiError.forbidden('That order does not belong to your account');
  }
  return ok(res, order);
});

export const createOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  const order = await createNewOrder(req.body, req.user!.id);
  return created(res, order, 'Order created successfully');
});

export const updateOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  const order = await updateExistingOrder(Number(req.params.id), req.body);
  return ok(res, order, 'Order updated successfully');
});

export const updateOrderStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { order_status: OrderStatus; payment_status?: PaymentStatus; note?: string };
  const result = await changeOrderStatus(Number(req.params.id), body, req.user!.id);
  return ok(
    res,
    result,
    result.restocked > 0
      ? `Status updated. ${result.restocked} item(s) returned to stock.`
      : 'Status updated'
  );
});

export const deleteOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  await removeOrder(Number(req.params.id));
  return noContent(res);
});

export const orderHistoryHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getOrderHistory(Number(req.params.id)));
});

export const addOrderHistoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const history = await addOrderHistoryNote(
    Number(req.params.id),
    req.body as { status: OrderStatus; note?: string },
    req.user!.id
  );
  return created(res, history, 'Tracking note added');
});

export const orderReceiptHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (req.user!.role === 'customer') {
    const order = await getOrder(id);
    if (order.user_id !== req.user!.id) {
      throw ApiError.forbidden('That order does not belong to your account');
    }
  }
  return ok(res, await getReceipt(id));
});

export const exportOrdersHandler = asyncHandler(async (req: Request, res: Response) => {
  const format = req.query.format === 'json' ? 'json' : 'csv';
  const file = await exportOrders(orderFilters(req), format);
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  return res.send(file.body);
});

/** Customer checkout: converts the signed-in customer's cart into an order. */
export const checkoutHandler = asyncHandler(async (req: Request, res: Response) => {
  const order = await checkout(req.user!.id, req.body);
  return created(res, order, `Order ${order.order_number} placed`);
});

/**
 * Called by the Stripe success page with the session id from the redirect. The
 * service retrieves the session from Stripe, so a forged query string cannot
 * mark an order paid.
 */
export const confirmStripePaymentHandler = asyncHandler(async (req: Request, res: Response) => {
  const order = await confirmStripePayment(
    req.user!.id,
    Number(req.params.id),
    String(req.body.session_id)
  );
  return ok(res, order, 'Payment confirmed');
});

/**
 * Called by the PayPal return page with the `token` PayPal appended to the
 * return URL. The order is captured and matched before it is marked paid.
 */
export const confirmPayPalPaymentHandler = asyncHandler(async (req: Request, res: Response) => {
  const order = await confirmPayPalPayment(
    req.user!.id,
    Number(req.params.id),
    String(req.body.paypal_order_id)
  );
  return ok(res, order, 'Payment confirmed');
});

/** Called when the customer closes PayPal's approval page without paying. */
export const cancelPayPalPaymentHandler = asyncHandler(async (req: Request, res: Response) => {
  const order = await cancelPayPalPayment(req.user!.id, Number(req.params.id));
  return ok(res, order, 'PayPal checkout cancelled');
});

/**
 * Stripe webhook. Mounted directly on the app (before the JSON parser) because
 * signature verification needs the raw request body, and Stripe cannot send a
 * CSRF token or session cookie.
 */
export const stripeWebhookHandler = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  await handleStripeWebhook(
    req.body as Buffer,
    Array.isArray(signature) ? signature[0] : signature
  );
  return ok(res, { received: true });
});
