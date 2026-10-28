import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { requireAdmin, requireStaff } from '../middleware/rbac';
import { authenticate } from '../middleware/auth';
import {
  activityLogHandler,
  changeRoleHandler,
  changeStatusHandler,
  createCustomerAddressHandler,
  createUserHandler,
  customerAddressesHandler,
  customerOrdersHandler,
  deleteUserHandler,
  getUserHandler,
  listUsersHandler,
  updateUserHandler,
  usersStatsHandler,
} from '../controllers/user.controller';
import {
  changeUserRoleSchema,
  changeUserStatusSchema,
  createUserSchema,
  updateUserSchema,
  userListQuerySchema,
} from '../validators/user.validator';
import { idParamSchema } from '../validators/common.validator';
import { addressSchema } from '../validators/order.validator';
import { getCustomerOrderSummary } from '../models/user.model';

const router = Router();

/** Every route here is admin-only; `requireAdmin` guards the whole router. */
router.use(authenticate, requireAdmin);

/** Staff may read the user table, but only an admin may change or remove anyone. */
router.get('/', requireStaff, validate(userListQuerySchema, 'query'), listUsersHandler);
// Literal paths come before `/:id` so "stats" is not parsed as an id.
router.get('/stats', requireStaff, usersStatsHandler);
router.get('/activity', requireStaff, activityLogHandler);
router.get('/:id', requireStaff, validate(idParamSchema, 'params'), getUserHandler);

router.post('/', validate(createUserSchema), createUserHandler);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), updateUserHandler);
router.patch('/:id/role', validate(idParamSchema, 'params'), validate(changeUserRoleSchema), changeRoleHandler);
router.patch('/:id/status', validate(idParamSchema, 'params'), validate(changeUserStatusSchema), changeStatusHandler);
router.delete('/:id', validate(idParamSchema, 'params'), deleteUserHandler);

// Customer sub-resources, reachable from the Customers module.
router.get('/:id/orders', requireStaff, validate(idParamSchema, 'params'), customerOrdersHandler);
router.get('/:id/addresses', requireStaff, validate(idParamSchema, 'params'), customerAddressesHandler);
router.post('/:id/addresses', validate(idParamSchema, 'params'), validate(addressSchema), createCustomerAddressHandler);
router.get('/:id/summary', requireStaff, validate(idParamSchema, 'params'), async (req, res, next) => {
  try {
    res.json({ success: true, data: await getCustomerOrderSummary(Number(req.params.id), 5) });
  } catch (error) {
    next(error);
  }
});

export default router;
