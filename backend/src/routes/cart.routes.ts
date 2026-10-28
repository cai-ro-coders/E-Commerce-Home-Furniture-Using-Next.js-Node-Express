import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import {
  addCartItemHandler,
  cartSummaryHandler,
  clearCartHandler,
  getCartBadgeHandler,
  getCartHandler,
  removeCartItemHandler,
  summaryCouponHandler,
  updateCartItemHandler,
} from '../controllers/cart.controller';
import { addCartItemSchema, updateCartItemSchema } from '../validators/order.validator';
import { itemIdParamSchema } from '../validators/common.validator';

const router = Router();

/**
 * The customer's own basket. The router is mounted at `/api/cart`, so these
 * paths are the last segment only — `/api/cart/items`, not `/api/cart/cart`.
 */
router.use(authenticate);

router.get('/', getCartHandler);
router.get('/badge', getCartBadgeHandler);
router.get('/summary', cartSummaryHandler);

router.post('/items', validate(addCartItemSchema), addCartItemHandler);
router.put(
  '/items/:itemId',
  validate(itemIdParamSchema, 'params'),
  validate(updateCartItemSchema),
  updateCartItemHandler
);
router.delete('/items/:itemId', validate(itemIdParamSchema, 'params'), removeCartItemHandler);
router.delete('/', clearCartHandler);

// Applying a coupon is per-request state, not something stored on the cart row.
router.post('/coupon', summaryCouponHandler);

export default router;
