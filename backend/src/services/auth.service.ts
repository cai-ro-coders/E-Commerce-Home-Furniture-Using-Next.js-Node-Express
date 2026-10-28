import type { Request, Response } from 'express';
import { execute, queryOne, transaction } from '../config/database';
import type { RowDataPacket } from 'mysql2';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { hashPassword, verifyPassword, checkPasswordStrength } from '../utils/password';
import { randomToken, sha256, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { issueCsrfToken } from '../middleware/csrf';
import { logActivity } from '../middleware/activityLog';
import {
  createUser,
  emailExists,
  findUserByEmail,
  findUserById,
  recordSuccessfulLogin,
  writeLoginHistory,
} from '../models/user.model';
import type { AuthUser, ListQuery, UserRole } from '../types';
import { listSessions, revokeOtherSessions } from '../models/session.model';

const REFRESH_REMEMBER_DAYS = 30;
const REFRESH_DEFAULT_DAYS = 7;
const RESET_TOKEN_TTL_MINUTES = 60;

function clientIp(req: Request): string | null {
  return req.ip ?? null;
}

function userAgent(req: Request): string | null {
  return (req.headers['user-agent'] as string | undefined)?.slice(0, 255) ?? null;
}

/** Set httpOnly auth cookies. `maxAge: undefined` creates a session cookie. */
function setAuthCookies(res: Response, accessToken: string, refreshToken: string, rememberMe: boolean): void {
  const base = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.isProduction,
    domain: env.auth.cookieDomain,
    path: '/',
  };

  res.cookie(env.auth.cookieName, accessToken, {
    ...base,
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined,
  });

  const days = rememberMe ? REFRESH_REMEMBER_DAYS : REFRESH_DEFAULT_DAYS;
  res.cookie(env.auth.refreshCookieName, refreshToken, {
    ...base,
    maxAge: days * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  const options = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.isProduction,
    domain: env.auth.cookieDomain,
    path: '/',
  };
  res.clearCookie(env.auth.cookieName, options);
  res.clearCookie(env.auth.refreshCookieName, options);
}

function toAuthUser(row: {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  status: AuthUser['status'];
  avatar: string | null;
}): AuthUser {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
    avatar: row.avatar,
  };
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Create a server-side session row and mint the token pair.
 *
 * The session id has to exist before the refresh token is signed (the id is
 * embedded in the payload), so the row is inserted with a placeholder hash and
 * immediately updated. Both statements are in one transaction so a failure
 * cannot leave an orphaned placeholder session behind.
 */
async function issueSession(
  user: AuthUser,
  req: Request,
  rememberMe: boolean
): Promise<AuthResult> {
  const days = rememberMe ? REFRESH_REMEMBER_DAYS : REFRESH_DEFAULT_DAYS;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return transaction(async (connection) => {
    const [insert] = await connection.execute(
      'INSERT INTO sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)',
      [user.id, 'pending', userAgent(req), clientIp(req), expiresAt]
    );
    const sessionId = (insert as { insertId: number }).insertId;

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    });
    const refreshToken = signRefreshToken(user.id, sessionId);

    // Store only the hash: a leaked database row cannot be replayed as a token.
    await connection.execute(
      'UPDATE sessions SET refresh_token_hash = ?, last_used_at = NOW() WHERE id = ?',
      [sha256(refreshToken), sessionId]
    );

    return { user, accessToken, refreshToken };
  });
}

export async function register(
  req: Request,
  res: Response,
  data: { full_name: string; email: string; password: string; phone?: string }
): Promise<{ user: AuthUser; accessToken: string }> {
  if (await emailExists(data.email)) {
    throw ApiError.conflict('An account with that email already exists');
  }

  const password = await hashPassword(data.password);
  const userId = await createUser({
    full_name: data.full_name,
    email: data.email,
    password,
    phone: data.phone ?? null,
    role: 'customer',
    status: 'active',
  });

  const created = await findUserById(userId);
  if (!created) throw ApiError.internal('Failed to create account');

  const user = toAuthUser(created);
  const { accessToken, refreshToken } = await issueSession(user, req, false);

  setAuthCookies(res, accessToken, refreshToken, false);
  issueCsrfToken(res);

  logActivity(req, userId, { action: 'register', entity: 'user', entityId: userId, description: 'Account created' });

  return { user, accessToken };
}

export async function login(
  req: Request,
  res: Response,
  data: { email: string; password: string; remember_me: boolean }
): Promise<{ user: AuthUser; accessToken: string }> {
  const ip = clientIp(req);
  const ua = userAgent(req);
  const user = await findUserByEmail(data.email);

  // Always run a bcrypt comparison so a missing account and a wrong password
  // take the same time — otherwise response timing enumerates valid emails.
  const hash = user?.password ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
  const passwordMatches = await verifyPassword(data.password, hash);

  if (!user || !passwordMatches) {
    await writeLoginHistory({
      userId: user?.id ?? null,
      email: data.email,
      success: false,
      reason: user ? 'bad_password' : 'unknown_email',
      ip,
      userAgent: ua,
    });
    throw ApiError.unauthorized('Incorrect email or password');
  }

  if (user.status === 'blocked') {
    await writeLoginHistory({ userId: user.id, email: data.email, success: false, reason: 'user_blocked', ip, userAgent: ua });
    throw ApiError.forbidden('This account has been blocked. Contact support.');
  }
  if (user.status === 'inactive') {
    await writeLoginHistory({ userId: user.id, email: data.email, success: false, reason: 'user_inactive', ip, userAgent: ua });
    throw ApiError.forbidden('This account is inactive. Contact support.');
  }

  await recordSuccessfulLogin(user.id, ip);
  await writeLoginHistory({ userId: user.id, email: data.email, success: true, ip, userAgent: ua });

  const authUser = toAuthUser(user);
  const { accessToken, refreshToken } = await issueSession(authUser, req, data.remember_me);

  setAuthCookies(res, accessToken, refreshToken, data.remember_me);
  issueCsrfToken(res);
  logActivity(req, user.id, { action: 'login', entity: 'user', entityId: user.id, description: 'Signed in' });

  return { user: authUser, accessToken };
}

/**
 * Exchange a valid refresh cookie for a new access token.
 * Rotates the refresh token and revokes the old session row (reuse detection).
 */
export async function refresh(req: Request, res: Response): Promise<{ user: AuthUser; accessToken: string }> {
  const token = (req.cookies as Record<string, string> | undefined)?.[env.auth.refreshCookieName];
  if (!token) throw ApiError.unauthorized('No refresh token provided');

  const payload = verifyRefreshToken(token);
  const tokenHash = sha256(token);

  const session = await queryOne<RowDataPacket & { id: number; user_id: number; expires_at: string; revoked_at: string | null }>(
    'SELECT id, user_id, expires_at, revoked_at FROM sessions WHERE refresh_token_hash = ? LIMIT 1',
    [tokenHash]
  );

  if (!session || session.revoked_at) {
    // A revoked token being replayed suggests theft: drop every session.
    if (session) {
      await execute('UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [
        session.user_id,
      ]);
      clearAuthCookies(res);
      throw ApiError.unauthorized('Session reuse detected. Please sign in again.');
    }
    throw ApiError.unauthorized('Invalid session');
  }

  if (new Date(session.expires_at.replace(' ', 'T')).getTime() < Date.now()) {
    throw ApiError.unauthorized('Session expired, please sign in again');
  }

  const user = await findUserById(session.user_id);
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  if (user.status !== 'active') throw ApiError.forbidden('This account is not active');

  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name,
  });
  const newRefreshToken = signRefreshToken(user.id, session.id);

  // Rotate in place: same session row, new hash. `last_used_at` is what the
  // account page shows as "last active", so it moves with the rotation.
  await execute('UPDATE sessions SET refresh_token_hash = ?, last_used_at = NOW() WHERE id = ?', [
    sha256(newRefreshToken),
    session.id,
  ]);

  const rememberCookie = (req.cookies as Record<string, string> | undefined)?.[
    env.auth.cookieName
  ]?.length;
  setAuthCookies(res, accessToken, newRefreshToken, Boolean(rememberCookie));
  issueCsrfToken(res);

  return { user: toAuthUser(user), accessToken };
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = (req.cookies as Record<string, string> | undefined)?.[env.auth.refreshCookieName];

  if (token) {
    await execute('UPDATE sessions SET revoked_at = NOW() WHERE refresh_token_hash = ?', [sha256(token)]);
  }
  if (req.user) {
    logActivity(req, req.user.id, { action: 'logout', entity: 'user', entityId: req.user.id, description: 'Signed out' });
  }

  clearAuthCookies(res);
}

/**
 * Issue a password-reset token.
 *
 * The endpoint always succeeds, whether or not the email exists, so it cannot
 * be used to discover which addresses are registered. In development the token
 * is returned in the response (there is no mail transport wired up yet).
 */
export async function forgotPassword(req: Request, email: string): Promise<{ token?: string }> {
  const user = await findUserByEmail(email);
  if (!user) return {};

  const token = randomToken(32);
  await execute('DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL', [user.id]);
  await execute(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, sha256(token), new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000)]
  );

  logActivity(req, user.id, {
    action: 'password_reset',
    entity: 'user',
    entityId: user.id,
    description: 'Password reset requested',
  });

  return env.isProduction ? {} : { token };
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const strength = checkPasswordStrength(password);
  if (!strength.valid) {
    throw ApiError.unprocessable('Password does not meet the security policy', strength.errors);
  }

  const record = await queryOne<RowDataPacket & { id: number; user_id: number; expires_at: string; used_at: string | null }>(
    'SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = ? LIMIT 1',
    [sha256(token)]
  );

  if (!record || record.used_at) throw ApiError.badRequest('This reset link is invalid or has already been used');
  if (new Date(record.expires_at.replace(' ', 'T')).getTime() < Date.now()) {
    throw ApiError.badRequest('This reset link has expired. Please request a new one.');
  }

  await transaction(async (connection) => {
    const hashed = await hashPassword(password);
    await connection.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, record.user_id]);
    await connection.execute('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [record.id]);
    // Force every device to sign in again after a password change.
    await connection.execute(
      'UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL',
      [record.user_id]
    );
  });
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await findUserById(userId, true);
  if (!user?.password) throw ApiError.notFound('Account not found');

  const matches = await verifyPassword(currentPassword, user.password);
  if (!matches) throw ApiError.badRequest('Current password is incorrect');

  if (await verifyPassword(newPassword, user.password)) {
    throw ApiError.badRequest('New password must be different from the current password');
  }

  const hashed = await hashPassword(newPassword);
  await execute('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
  // Revoke other sessions but keep the current one usable.
  await execute('UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [userId]);
}

export async function updateProfile(
  userId: number,
  data: { full_name?: string; phone?: string; avatar?: string }
): Promise<AuthUser> {
  const fields: Record<string, string> = {};
  if (data.full_name !== undefined) fields.full_name = data.full_name;
  if (data.phone !== undefined) fields.phone = data.phone;
  if (data.avatar !== undefined) fields.avatar = data.avatar;

  if (Object.keys(fields).length > 0) {
    const setSql = Object.keys(fields).map((key) => `\`${key}\` = ?`).join(', ');
    await execute(`UPDATE users SET ${setSql} WHERE id = ?`, [...Object.values(fields), userId]);
  }

  const updated = await findUserById(userId);
  if (!updated) throw ApiError.notFound('Account not found');
  return toAuthUser(updated);
}

/** Housekeeping: drop sessions that expired more than a day ago. */
export async function purgeExpiredSessions(): Promise<number> {
  const result = await execute('DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL 1 DAY');
  return result.affectedRows;
}

/** Hash of the refresh cookie on this request — the current device's identity. */
export function currentRefreshHash(req: Request): string | null {
  const token = (req.cookies as Record<string, string> | undefined)?.[env.auth.refreshCookieName];
  return token ? sha256(token) : null;
}

/** The signed-in user's active devices, newest activity first. */
export async function getUserSessions(req: Request, list: ListQuery) {
  return listSessions(req.user!.id, currentRefreshHash(req), list);
}

export { revokeOtherSessions };
