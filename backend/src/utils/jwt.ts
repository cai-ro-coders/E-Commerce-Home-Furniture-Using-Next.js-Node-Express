import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import type { JwtAccessPayload, JwtRefreshPayload, UserRole } from '../types';
import { ApiError } from './ApiError';

export function signAccessToken(payload: {
  id: number;
  email: string;
  role: UserRole;
  fullName: string;
}): string {
  const data: JwtAccessPayload = {
    sub: payload.id,
    email: payload.email,
    role: payload.role,
    full_name: payload.fullName,
    type: 'access',
  };
  return jwt.sign(data, env.auth.jwtSecret, {
    expiresIn: env.auth.accessExpires,
  } as SignOptions);
}

export function signRefreshToken(userId: number, sessionId: number): string {
  const data: JwtRefreshPayload = { sub: userId, sid: sessionId, type: 'refresh' };
  return jwt.sign(data, env.auth.jwtSecret, {
    expiresIn: env.auth.refreshExpires,
  } as SignOptions);
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  try {
    const decoded = jwt.verify(token, env.auth.jwtSecret) as unknown as JwtAccessPayload;
    if (decoded.type !== 'access') throw ApiError.unauthorized('Invalid token type');
    return decoded;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Session expired, please sign in again', 'TOKEN_EXPIRED');
    }
    throw ApiError.unauthorized('Invalid or tampered token');
  }
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
  try {
    const decoded = jwt.verify(token, env.auth.jwtSecret) as unknown as JwtRefreshPayload;
    if (decoded.type !== 'refresh') throw ApiError.unauthorized('Invalid token type');
    return decoded;
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }
}

/** Refresh tokens are stored server-side as a SHA-256 hash, never in plaintext. */
export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/** Opaque, URL-safe token for password-reset links. */
export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function randomOrderNumber(): string {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${stamp}-${random}`;
}
