import { Router } from 'express';
import type { Request, Response } from 'express';
import { asyncHandler, validate } from '../utils/asyncHandler';
import { requireAdmin, requireStaff } from '../middleware/rbac';
import { authenticate } from '../middleware/auth';
import { noContent, ok, paginated } from '../utils/ApiResponse';
import { parseListQuery } from '../utils/pagination';
import { query } from '../config/database';
import {
  deleteCustomerWithData,
  findUserById,
  getCustomerOrderSummary,
  listAddressesByUser,
  listLoginHistory,
  listUsers,
} from '../models/user.model';
import { updateCustomer } from '../services/user.service';
import { ApiError } from '../utils/ApiError';
import { updateCustomerSchema, userListQuerySchema } from '../validators/user.validator';
import { idParamSchema } from '../validators/common.validator';
import { customerOrdersHandler, customerAddressesHandler } from '../controllers/user.controller';
import type { RowDataPacket } from 'mysql2';

const router = Router();

router.use(authenticate, requireStaff);

/** The Customers module: the same user table, pinned to `role = 'customer'`. */
router.get(
  '/',
  validate(userListQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const list = parseListQuery(req);
    list.filters.role = 'customer';
    return paginated(res, await listUsers(list));
  })
);

/** Headline numbers for the Customers page header. */
router.get(
  '/stats',
  asyncHandler(async (_req: Request, res: Response) => {
    const [row] = await query<
      RowDataPacket & {
        total: number;
        active: number;
        blocked: number;
        new_this_month: number;
        lifetime_value: number;
      }
    >(
      `SELECT COUNT(*) AS total,
              SUM(status = 'active') AS active,
              SUM(status = 'blocked') AS blocked,
              SUM(created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) AS new_this_month,
              COALESCE(SUM((SELECT COALESCE(SUM(grand_total), 0) FROM orders o
                             WHERE o.user_id = u.id AND o.order_status <> 'Cancelled')), 0) AS lifetime_value
         FROM users u
        WHERE role = 'customer'`
    );
    return ok(res, {
      total: Number(row?.total ?? 0),
      active: Number(row?.active ?? 0),
      blocked: Number(row?.blocked ?? 0),
      new_this_month: Number(row?.new_this_month ?? 0),
      lifetime_value: Number(row?.lifetime_value ?? 0),
    });
  })
);

router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const customer = await findUserById(id);
    if (!customer || customer.role !== 'customer') throw ApiError.notFound('Customer not found');

    const [orders, addresses, loginHistory] = await Promise.all([
      getCustomerOrderSummary(id, 20),
      listAddressesByUser(id),
      listLoginHistory(id, 20),
    ]);
    return ok(res, { ...customer, orders, addresses, login_history: loginHistory });
  })
);

router.get('/:id/orders', validate(idParamSchema, 'params'), customerOrdersHandler);
router.get('/:id/addresses', validate(idParamSchema, 'params'), customerAddressesHandler);
router.get('/:id/login-history', validate(idParamSchema, 'params'), asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await listLoginHistory(Number(req.params.id), 50));
}));

/**
 * Edit a customer from the Customers module. Role is deliberately not editable
 * here — a customer promoted to staff belongs in the Users module, so the two
 * screens cannot disagree about what an account is.
 */
router.put(
  '/:id',
  requireAdmin,
  validate(idParamSchema, 'params'),
  validate(updateCustomerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const customer = await findUserById(id);
    if (!customer || customer.role !== 'customer') throw ApiError.notFound('Customer not found');
    const updated = await updateCustomer(id, req.body);
    return ok(res, updated, 'Customer updated');
  })
);

router.delete(
  '/:id',
  requireAdmin,
  validate(idParamSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const customer = await findUserById(id);
    if (!customer || customer.role !== 'customer') throw ApiError.notFound('Customer not found');
    // Their orders survive with a null user_id so sales history stays intact.
    await deleteCustomerWithData(id);
    return noContent(res);
  })
);

export default router;
