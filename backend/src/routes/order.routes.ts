import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { requireStaff } from '../middleware/rbac';
import {
  addOrderHistoryHandler,
  cancelPayPalPaymentHandler,
  checkoutHandler,
  confirmPayPalPaymentHandler,
  confirmStripePaymentHandler,
  createOrderHandler,
  deleteOrderHandler,
  exportOrdersHandler,
  getOrderHandler,
  listOrdersHandler,
  orderHistoryHandler,
  orderReceiptHandler,
  orderStatsHandler,
  updateOrderHandler,
  updateOrderStatusHandler,
} from '../controllers/order.controller';
import {
  checkoutSchema,
  confirmPayPalPaymentSchema,
  confirmStripePaymentSchema,
  createOrderSchema,
  orderListQuerySchema,
  orderStatusHistorySchema,
  updateOrderSchema,
  updateOrderStatusSchema,
} from '../validators/order.validator';
import { idParamSchema } from '../validators/common.validator';

const router = Router();

// A customer may list their own orders; `listOrdersHandler` narrows the query
// by user id for anyone who is not staff.
router.use(authenticate);

// Literal paths are declared before `/:id` so `stats` and `export` are not
// swallowed by the id parameter (which would 422 on a non-numeric value).
router.get('/', validate(orderListQuerySchema, 'query'), listOrdersHandler);

// Stats and exports are store-wide, so they are staff-only.
router.get('/stats', requireStaff, orderStatsHandler);
router.get('/export', requireStaff, exportOrdersHandler);

router.get('/:id', validate(idParamSchema, 'params'), getOrderHandler);
router.get('/:id/history', validate(idParamSchema, 'params'), orderHistoryHandler);
router.get('/:id/receipt', validate(idParamSchema, 'params'), orderReceiptHandler);

/** Customer checkout: turns the signed-in customer's basket into an order. */
router.post('/checkout', validate(checkoutSchema), checkoutHandler);

/** Stripe success page settles the order after retrieving the session. */
router.post(
  '/:id/stripe/confirm',
  validate(idParamSchema, 'params'),
  validate(confirmStripePaymentSchema),
  confirmStripePaymentHandler
);

/** PayPal return page captures the approved order before settling it. */
router.post(
  '/:id/paypal/confirm',
  validate(idParamSchema, 'params'),
  validate(confirmPayPalPaymentSchema),
  confirmPayPalPaymentHandler
);

/** PayPal cancel page releases the stock held by the pending order. */
router.post(
  '/:id/paypal/cancel',
  validate(idParamSchema, 'params'),
  cancelPayPalPaymentHandler
);

router.post('/', requireStaff, validate(createOrderSchema), createOrderHandler);
router.put(
  '/:id',
  requireStaff,
  validate(idParamSchema, 'params'),
  validate(updateOrderSchema),
  updateOrderHandler
);
router.patch(
  '/:id/status',
  requireStaff,
  validate(idParamSchema, 'params'),
  validate(updateOrderStatusSchema),
  updateOrderStatusHandler
);
router.post(
  '/:id/history',
  requireStaff,
  validate(idParamSchema, 'params'),
  validate(orderStatusHistorySchema),
  addOrderHistoryHandler
);
router.delete('/:id', requireStaff, validate(idParamSchema, 'params'), deleteOrderHandler);

export default router;
