import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

/**
 * CSRF protection using the double-submit-cookie pattern.
 *
 * Because the access token lives in an httpOnly cookie, a cross-site form post
 * would otherwise be authenticated automatically. Requiring the caller to also
 * send the token in a custom header means a third-party page cannot read it
 * (SameSite + SOP) and therefore cannot forge the request.
 *
 * The token is also readable by our own JS (`document.cookie`) so the frontend
 * can echo it back in the `x-csrf-token` header.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (!env.auth.csrfProtection) {
    next();
    return;
  }

  let token = req.cookies?.[CSRF_COOKIE] as string | undefined;

  if (!token) {
    token = crypto.randomBytes(24).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: env.isProduction,
      domain: env.auth.cookieDomain,
      path: '/',
    });
  }

  // Expose it to the SPA on every response, including the first one.
  res.setHeader('x-csrf-token', token);
  req.csrfToken = token;

  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const headerValue = req.headers[CSRF_HEADER] ?? req.body?._csrf;

  if (!headerValue || headerValue !== token) {
    next(
      new ApiError(
        403,
        'Invalid or missing CSRF token. Refresh the page and try again.',
        'CSRF_TOKEN_MISMATCH'
      )
    );
    return;
  }

  next();
}

/** Issue a fresh CSRF cookie — called by the auth routes after login/refresh. */
export function issueCsrfToken(res: Response): string {
  const token = crypto.randomBytes(24).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: env.isProduction,
    domain: env.auth.cookieDomain,
    path: '/',
  });
  res.setHeader('x-csrf-token', token);
  return token;
}

export { CSRF_HEADER, CSRF_COOKIE };
