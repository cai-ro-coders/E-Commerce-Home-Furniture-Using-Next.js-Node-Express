import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireStaff } from '../middleware/rbac';
import {
  createReviewHandler,
  deleteReviewHandler,
  exportReviewsHandler,
  getReviewHandler,
  listReviewsHandler,
  moderateReviewHandler,
  productReviewsHandler,
  reviewStatsHandler,
  updateReviewHandler,
} from '../controllers/review.controller';
import {
  createReviewSchema,
  reviewListQuerySchema,
  updateReviewSchema,
} from '../validators/order.validator';
import { idParamSchema } from '../validators/common.validator';

const router = Router();

/** Public: the product detail page shows the approved review list. */
router.get('/product/:id', optionalAuth, productReviewsHandler);

router.use(authenticate);

/** A customer may review a product they bought; the service verifies the order. */
router.post('/', validate(createReviewSchema), createReviewHandler);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateReviewSchema), updateReviewHandler);
router.delete('/:id', validate(idParamSchema, 'params'), deleteReviewHandler);

router.use(requireStaff);

router.get('/', validate(reviewListQuerySchema, 'query'), listReviewsHandler);
router.get('/stats', reviewStatsHandler);
router.get('/export', exportReviewsHandler);
router.get('/:id', validate(idParamSchema, 'params'), getReviewHandler);
router.patch('/:id/status', validate(idParamSchema, 'params'), moderateReviewHandler);

export default router;
