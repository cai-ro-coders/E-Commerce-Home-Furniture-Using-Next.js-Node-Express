import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireStaff } from '../middleware/rbac';
import {
  couponUsagesHandler,
  createCouponHandler,
  deleteCouponHandler,
  exportCouponsHandler,
  getCouponHandler,
  listCouponsHandler,
  updateCouponHandler,
  validateCouponHandler,
} from '../controllers/coupon.controller';
import {
  couponListQuerySchema,
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from '../validators/catalog.validator';
import { idParamSchema } from '../validators/common.validator';

const router = Router();

/** Anyone may test a code at checkout; the service enforces the per-user limit. */
router.post('/validate', optionalAuth, validate(validateCouponSchema), validateCouponHandler);

router.use(authenticate, requireStaff);

router.get('/', validate(couponListQuerySchema, 'query'), listCouponsHandler);
router.get('/export', exportCouponsHandler);
router.get('/:id', validate(idParamSchema, 'params'), getCouponHandler);
router.get(
  '/:id/usages',
  validate(idParamSchema, 'params'),
  validate(couponListQuerySchema, 'query'),
  couponUsagesHandler
);
router.post('/', validate(createCouponSchema), createCouponHandler);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateCouponSchema), updateCouponHandler);
router.delete('/:id', validate(idParamSchema, 'params'), deleteCouponHandler);

export default router;
