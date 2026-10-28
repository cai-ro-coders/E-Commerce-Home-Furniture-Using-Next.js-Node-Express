import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok, paginated } from '../utils/ApiResponse';
import { parseListQuery } from '../utils/pagination';
import {
  addCustomerAddress,
  createNewUser,
  getActivityLog,
  getCustomerAddresses,
  getCustomerOrders,
  getUserById,
  getUserStats,
  getUsers,
  removeUser,
  setUserRole,
  setUserStatus,
  updateNewUser,
} from '../services/user.service';
import {
  createAddress,
  deleteAddress,
  findAddressById,
  listAddressesByUser,
  updateAddress,
} from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import type { AddressRecord } from '../models/user.model';
import type { UserRole, UserStatus } from '../types';

/** Header counters for the Users module: totals by role and by status. */
export const usersStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await getUserStats());
});

export const listUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await getUsers(parseListQuery(req));
  return paginated(res, result);
});

export const getUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(req.params.id as unknown as number);
  return ok(res, user);
});

export const createUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await createNewUser(req.body as never);
  return created(res, user, 'User created successfully');
});

export const updateUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateNewUser(
    req.params.id as unknown as number,
    req.body,
    req.user!.id
  );
  return ok(res, user, 'User updated successfully');
});

export const deleteUserHandler = asyncHandler(async (req: Request, res: Response) => {
  await removeUser(req.params.id as unknown as number, req.user!.id);
  return noContent(res);
});

export const changeRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await setUserRole(
    req.params.id as unknown as number,
    req.body.role as UserRole,
    req.user!.id
  );
  return ok(res, user, 'Role updated successfully');
});

export const changeStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await setUserStatus(
    req.params.id as unknown as number,
    req.body.status as UserStatus,
    req.user!.id
  );
  return ok(res, user, 'Status updated successfully');
});

export const activityLogHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await getActivityLog(parseListQuery(req));
  return paginated(res, result);
});

// ---------------------------------------------------------------- customers
export const customerOrdersHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getCustomerOrders(req.params.id as unknown as number);
  return ok(res, data);
});

export const customerAddressesHandler = asyncHandler(async (req: Request, res: Response) => {
  const addresses = await getCustomerAddresses(req.params.id as unknown as number);
  return ok(res, addresses);
});

export const createCustomerAddressHandler = asyncHandler(async (req: Request, res: Response) => {
  const addresses = await addCustomerAddress(req.params.id as unknown as number, req.body);
  return created(res, addresses, 'Address saved');
});

export const listAddressesHandler = asyncHandler(async (req: Request, res: Response) => {
  const addresses = await listAddressesByUser(req.user!.id);
  return ok(res, addresses);
});

export const createAddressHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const address: Partial<AddressRecord> = {
    full_name: String(body.full_name ?? ''),
    phone: String(body.phone ?? ''),
    address_line_1: String(body.address_line_1 ?? ''),
    address_line_2: body.address_line_2 ? String(body.address_line_2) : null,
    city: String(body.city ?? ''),
    province: body.province ? String(body.province) : null,
    postal_code: body.postal_code ? String(body.postal_code) : null,
    country: body.country ? String(body.country) : 'Philippines',
    is_default: body.is_default ? 1 : 0,
  };
  await createAddress(req.user!.id, address);
  const addresses = await listAddressesByUser(req.user!.id);
  return created(res, addresses, 'Address saved');
});

/** Load an address and assert it belongs to the signed-in customer. */
async function ownAddress(id: number, userId: number) {
  const address = await findAddressById(id);
  if (!address) throw ApiError.notFound('Address not found');
  if (address.user_id !== userId) throw ApiError.forbidden('Not your address');
  return address;
}

export const updateAddressHandler = asyncHandler(async (req: Request, res: Response) => {
  const address = await ownAddress(req.params.id as unknown as number, req.user!.id);
  const body = req.body as Record<string, unknown>;
  const patch: Partial<AddressRecord> = {};
  if (body.full_name !== undefined) patch.full_name = String(body.full_name);
  if (body.phone !== undefined) patch.phone = String(body.phone);
  if (body.address_line_1 !== undefined) patch.address_line_1 = String(body.address_line_1);
  if (body.address_line_2 !== undefined) {
    patch.address_line_2 = body.address_line_2 === null ? null : String(body.address_line_2);
  }
  if (body.city !== undefined) patch.city = String(body.city);
  if (body.province !== undefined) {
    patch.province = body.province === null ? null : String(body.province);
  }
  if (body.postal_code !== undefined) {
    patch.postal_code = body.postal_code === null ? null : String(body.postal_code);
  }
  if (body.country !== undefined) patch.country = String(body.country);
  if (body.is_default !== undefined) patch.is_default = body.is_default ? 1 : 0;

  await updateAddress(address.id, patch);
  const addresses = await listAddressesByUser(req.user!.id);
  return ok(res, addresses, 'Address updated');
});

export const deleteAddressHandler = asyncHandler(async (req: Request, res: Response) => {
  const address = await ownAddress(req.params.id as unknown as number, req.user!.id);
  await deleteAddress(address.id);
  return noContent(res);
});
