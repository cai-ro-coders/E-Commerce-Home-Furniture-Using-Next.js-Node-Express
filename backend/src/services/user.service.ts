import { query, queryOne, type SqlParam } from '../config/database';
import type { RowDataPacket } from 'mysql2';
import { ApiError } from '../utils/ApiError';
import { hashPassword } from '../utils/password';
import type { UpdateCustomerInput } from '../validators/user.validator';
import {
  createAddress,
  createUser,
  deleteCustomerWithData,
  deleteUser,
  emailExists,
  findUserById,
  getCustomerOrderSummary,
  listActivityLog,
  listAddressesByUser,
  listLoginHistory,
  listUsers,
  updateUser as updateUserRecord,
  type AddressRecord,
} from '../models/user.model';
import { execute } from '../config/database';
import type { ListQuery, UserRole, UserStatus } from '../types';

export async function getUsers(list: ListQuery) {
  return listUsers(list);
}

/** Counts behind the Users module's stat cards. */
export async function getUserStats() {
  const [row] = await query<
    RowDataPacket & {
      total: number;
      admins: number;
      staff: number;
      customers: number;
      active: number;
      inactive: number;
      blocked: number;
      new_this_month: number;
    }
  >(
    `SELECT COUNT(*)                                          AS total,
            SUM(role = 'admin')                               AS admins,
            SUM(role = 'staff')                               AS staff,
            SUM(role = 'customer')                            AS customers,
            SUM(status = 'active')                            AS active,
            SUM(status = 'inactive')                          AS inactive,
            SUM(status = 'blocked')                           AS blocked,
            SUM(created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) AS new_this_month
       FROM users`
  );

  return {
    total: Number(row?.total ?? 0),
    admins: Number(row?.admins ?? 0),
    staff: Number(row?.staff ?? 0),
    customers: Number(row?.customers ?? 0),
    active: Number(row?.active ?? 0),
    inactive: Number(row?.inactive ?? 0),
    blocked: Number(row?.blocked ?? 0),
    new_this_month: Number(row?.new_this_month ?? 0),
  };
}

export async function getUserById(id: number) {
  const user = await findUserById(id);
  if (!user) throw ApiError.notFound('User not found');

  const [addresses, orders, loginHistory, activities] = await Promise.all([
    listAddressesByUser(id),
    getCustomerOrderSummary(id, 10),
    listLoginHistory(id, 10),
    query(
      'SELECT action, entity, description, ip_address, created_at FROM user_activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 15',
      [id]
    ),
  ]);

  return { ...user, addresses, orders, login_history: loginHistory, activities };
}

export async function createNewUser(data: {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
}) {
  if (await emailExists(data.email)) {
    throw ApiError.conflict('A user with that email already exists');
  }
  const id = await createUser({
    full_name: data.full_name,
    email: data.email,
    password: await hashPassword(data.password),
    phone: data.phone ?? null,
    avatar: data.avatar ?? null,
    role: data.role,
    status: data.status,
  });
  return findUserById(id);
}

export async function updateNewUser(
  id: number,
  data: Record<string, unknown>,
  actorId: number
) {
  const existing = await findUserById(id);
  if (!existing) throw ApiError.notFound('User not found');

  if (data.email && typeof data.email === 'string' && data.email !== existing.email) {
    if (await emailExists(data.email, id)) {
      throw ApiError.conflict('A user with that email already exists');
    }
  }

  // A blank password field on the edit form means "leave the hash unchanged".
  const patch: Record<string, SqlParam> = {};
  if (data.full_name !== undefined) patch.full_name = data.full_name as string;
  if (data.email !== undefined) patch.email = data.email as string;
  if (data.phone !== undefined) patch.phone = data.phone as string;
  if (data.avatar !== undefined) patch.avatar = data.avatar as string;
  if (data.role !== undefined) patch.role = data.role as string;
  if (data.status !== undefined) patch.status = data.status as string;
  if (typeof data.password === 'string' && data.password.length > 0) {
    patch.password = await hashPassword(data.password);
  }

  // Guard against an admin locking themselves out of their own account.
  if (id === actorId && patch.role !== undefined && patch.role !== 'admin') {
    throw ApiError.badRequest('You cannot change your own role');
  }
  if (id === actorId && patch.status !== undefined && patch.status !== 'active') {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }

  await updateUserRecord(id, patch);
  return findUserById(id);
}

/**
 * Edit a customer from the Customers module.
 *
 * Narrower than `updateUser`: no role or password changes here, so a customer
 * can never be promoted (or have their credentials replaced) by a screen that
 * is not the Users module.
 */
export async function updateCustomer(id: number, data: UpdateCustomerInput) {
  const user = await findUserById(id);
  if (!user) throw ApiError.notFound('Customer not found');

  if (data.email !== undefined && (await emailExists(data.email, id))) {
    throw ApiError.conflict('Another account already uses that email address');
  }

  const patch: Record<string, SqlParam> = {};
  if (data.full_name !== undefined) patch.full_name = data.full_name;
  if (data.email !== undefined) patch.email = data.email;
  if (data.phone !== undefined) patch.phone = data.phone;
  if (data.avatar !== undefined) patch.avatar = data.avatar;
  if (data.status !== undefined) patch.status = data.status;

  if (Object.keys(patch).length > 0) await updateUserRecord(id, patch);
  return findUserById(id);
}

export async function removeUser(id: number, actorId: number) {
  if (id === actorId) throw ApiError.badRequest('You cannot delete your own account');
  const user = await findUserById(id);
  if (!user) throw ApiError.notFound('User not found');

  if (user.role === 'admin') {
    const [admins] = await query<RowDataPacket & { total: number }>(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'admin' AND status = 'active'"
    );
    if (Number(admins?.total ?? 0) <= 1) {
      throw ApiError.badRequest('Cannot delete the last remaining administrator');
    }
  }

  // Cascade the customer's cart/wishlist/reviews; keep their order history.
  await deleteCustomerWithData(id);
  return true;
}

export async function setUserRole(id: number, role: UserRole, actorId: number) {
  if (id === actorId && role !== 'admin') {
    throw ApiError.badRequest('You cannot remove your own admin role');
  }
  const user = await findUserById(id);
  if (!user) throw ApiError.notFound('User not found');

  await updateUserRecord(id, { role });

  // A privilege change must invalidate existing sessions immediately.
  if (role !== user.role) {
    await execute('UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [id]);
  }
  return findUserById(id);
}

export async function setUserStatus(id: number, status: UserStatus, actorId: number) {
  if (id === actorId && status !== 'active') {
    throw ApiError.badRequest('You cannot block or deactivate your own account');
  }
  const user = await findUserById(id);
  if (!user) throw ApiError.notFound('User not found');

  if (status !== 'active') {
    const [admins] = await query<RowDataPacket & { total: number }>(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'admin' AND status = 'active'"
    );
    if (user.role === 'admin' && Number(admins?.total ?? 0) <= 1) {
      throw ApiError.badRequest('Cannot deactivate the last remaining administrator');
    }
    await execute('UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [id]);
  }

  await updateUserRecord(id, { status });
  return findUserById(id);
}

export async function getActivityLog(list: ListQuery) {
  return listActivityLog(list);
}

export async function getCustomerOrders(id: number) {
  const user = await findUserById(id);
  if (!user) throw ApiError.notFound('Customer not found');
  const orders = await query(
    `SELECT o.id, o.order_number, o.order_status, o.payment_status, o.payment_method,
            o.grand_total, o.created_at,
            (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`,
    [id]
  );
  return { customer: user, orders };
}

export async function getCustomerAddresses(id: number) {
  return listAddressesByUser(id);
}

export async function addCustomerAddress(
  userId: number,
  data: Record<string, unknown>
) {
  const address: Partial<AddressRecord> = {
    full_name: String(data.full_name ?? ''),
    phone: String(data.phone ?? ''),
    address_line_1: String(data.address_line_1 ?? ''),
    address_line_2: data.address_line_2 ? String(data.address_line_2) : null,
    city: String(data.city ?? ''),
    province: data.province ? String(data.province) : null,
    postal_code: data.postal_code ? String(data.postal_code) : null,
    country: data.country ? String(data.country) : 'Philippines',
    is_default: data.is_default ? 1 : 0,
  };
  await createAddress(userId, address);
  return listAddressesByUser(userId);
}

export async function customerCount(): Promise<number> {
  const row = await queryOne<RowDataPacket & { total: number }>(
    "SELECT COUNT(*) AS total FROM users WHERE role = 'customer'"
  );
  return Number(row?.total ?? 0);
}

export { deleteUser };
