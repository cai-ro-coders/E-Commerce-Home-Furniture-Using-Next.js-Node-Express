import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import {
  addWishlistHandler,
  checkWishlistHandler,
  getWishlistHandler,
  removeWishlistHandler,
  wishlistToCartHandler,
} from '../controllers/cart.controller';
import { addWishlistSchema } from '../validators/order.validator';
import { productIdParamSchema } from '../validators/common.validator';

const router = Router();

/** Everything in a wishlist belongs to the signed-in customer. */
router.use(authenticate);

router.get('/', getWishlistHandler);
router.post('/', validate(addWishlistSchema), addWishlistHandler);
router.get('/:productId', validate(productIdParamSchema, 'params'), checkWishlistHandler);
router.delete('/:productId', validate(productIdParamSchema, 'params'), removeWishlistHandler);

/** Move a saved product into the basket in one step. */
router.post('/:productId/to-cart', validate(productIdParamSchema, 'params'), wishlistToCartHandler);

export default router;
