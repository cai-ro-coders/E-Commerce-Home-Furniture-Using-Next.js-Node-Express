import rateLimit, { type Options } from 'express-rate-limit';
import type { Request, Response } from 'express';
import { env } from '../config/env';

function keyGenerator(req: Request): string {
  // Behind a proxy, trust X-Forwarded-For only when the app runs behind one.
  if (env.isProduction && req.headers['x-forwarded-for']) {
    const forwarded = req.headers['x-forwarded-for'];
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    if (first) return first.trim();
  }
  return req.ip ?? 'unknown';
}

const shared: Partial<Options> = {
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please slow down and try again shortly.',
      error: { code: 'TOO_MANY_REQUESTS' },
    });
  },
};

/** Broad ceiling applied to the whole /api surface. */
export const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  ...shared,
});

/** Tight limit on credential endpoints to blunt brute-force attempts. */
export const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  skipSuccessfulRequests: true, // only failed attempts count toward the limit
  ...shared,
});

/** Limit writes (POST/PUT/PATCH/DELETE) more aggressively than reads. */
export const writeLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: Math.max(60, Math.floor(env.rateLimit.max / 4)),
  skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method),
  ...shared,
});
