import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../utils/jwt';
import type { UserRole } from '../types';
import { queryOne } from '../config/database';
import type { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'blocked';
  avatar: string | null;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  const cookieToken = (req.cookies as Record<string, string> | undefined)?.[
    env.auth.cookieName
  ];
  return cookieToken ?? null;
}

/**
 * Reject the request unless it carries a valid, unexpired access token for an
 * account that is still active. The user row is re-read on every request so a
 * role change, block, or deletion takes effect immediately rather than waiting
 * for the token to expire.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized('Authentication required');

    const payload = verifyAccessToken(token);

    const user = await queryOne<UserRow>(
      'SELECT id, full_name, email, role, status, avatar FROM users WHERE id = ? LIMIT 1',
      [payload.sub]
    );

    if (!user) throw ApiError.unauthorized('Account no longer exists');
    if (user.status === 'blocked') throw ApiError.forbidden('This account has been blocked');
    if (user.status === 'inactive') throw ApiError.forbidden('This account is inactive');

    req.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
    };
    next();
  } catch (error) {
    next(error);
  }
}

/** Attach `req.user` when a valid token exists, but never fail the request. */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    await authenticate(req, _res, (err?: unknown) => {
      if (err) throw err;
    });
  } catch {
    // ignore — this route does not require auth
  }
  next();
}
