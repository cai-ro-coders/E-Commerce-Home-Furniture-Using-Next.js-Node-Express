import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok, paginated } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { parseListQuery } from '../utils/pagination';
import {
  changePassword,
  currentRefreshHash,
  forgotPassword,
  getUserSessions,
  login,
  logout,
  refresh,
  register,
  resetPassword,
  revokeOtherSessions,
  updateProfile,
} from '../services/auth.service';
import { findUserById, listAddressesByUser, listLoginHistory } from '../models/user.model';
import { revokeSession } from '../models/session.model';
import { getCartBadge } from '../services/cart.service';
import { getUnreadCount } from '../services/notification.service';
import { query } from '../config/database';
import type { RowDataPacket } from 'mysql2';

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await register(req, res, req.body);
  return created(res, result, 'Account created successfully');
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await login(req, res, req.body);
  return ok(res, result, 'Signed in successfully');
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  await logout(req, res);
  return ok(res, null, 'Signed out successfully');
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await refresh(req, res);
  return ok(res, result, 'Session refreshed');
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await findUserById(req.user!.id);
  if (!user) throw ApiError.notFound('Account not found');

  const [cart, notifications] = await Promise.all([
    getCartBadge(req.user!.id),
    getUnreadCount(req.user!.id),
  ]);

  const { password: _password, ...safeUser } = user as unknown as Record<string, unknown>;
  return ok(res, { user: safeUser, cart, notifications }, 'Current user');
});

export const forgotPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await forgotPassword(req, req.body.email);
  // The same message is returned whether or not the account exists.
  return ok(
    res,
    result,
    'If an account with that email exists, a password reset link has been sent.'
  );
});

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  await resetPassword(req.body.token, req.body.password);
  return ok(res, null, 'Password has been reset. Please sign in.');
});

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  await changePassword(req.user!.id, req.body.current_password, req.body.password);
  return ok(res, null, 'Password updated successfully');
});

export const updateProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateProfile(req.user!.id, req.body);
  return ok(res, { user }, 'Profile updated successfully');
});

/** Devices currently signed in on this account, with the caller's own marked. */
export const listSessionsHandler = asyncHandler(async (req: Request, res: Response) => {
  return paginated(res, await getUserSessions(req, parseListQuery(req)));
});

export const revokeSessionHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const currentHash = currentRefreshHash(req);
  if (!(await revokeSession(id, req.user!.id))) {
    throw ApiError.notFound('That session is no longer active');
  }
  void currentHash;
  return ok(res, { id }, 'Session signed out');
});

export const revokeOtherSessionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const revoked = await revokeOtherSessions(req.user!.id, currentRefreshHash(req) ?? '');
  return ok(res, { revoked }, `Signed out of ${revoked} other device${revoked === 1 ? '' : 's'}`);
});

/** Recent sign-in attempts on this account, successful and failed. */
export const loginHistoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  return ok(res, await listLoginHistory(req.user!.id, limit));
});

/** The signed-in customer's own addresses, profile extras, and login history. */
export const accountHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const [user, addresses, history, wishlistCount] = await Promise.all([
    findUserById(userId),
    listAddressesByUser(userId),
    listLoginHistory(userId, 20),
    query<RowDataPacket & { total: number }>(
      'SELECT COUNT(*) AS total FROM wishlists WHERE user_id = ?',
      [userId]
    ),
  ]);
  if (!user) throw ApiError.notFound('Account not found');

  const { password: _password, ...safeUser } = user as unknown as Record<string, unknown>;
  return ok(res, {
    user: safeUser,
    addresses,
    login_history: history,
    wishlist_count: Number(wishlistCount[0]?.total ?? 0),
  });
});
