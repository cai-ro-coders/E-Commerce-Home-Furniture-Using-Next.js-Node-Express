import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import type { UserRole } from '../types';

/**
 * Role-based access control.
 *
 * `admin` is deliberately NOT part of the public role list here — every check
 * is an explicit allow-list, so adding a new role is a conscious decision
 * rather than something that silently inherits admin powers.
 */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(
        ApiError.forbidden(
          `This action requires one of the following roles: ${roles.join(', ')}`
        )
      );
      return;
    }
    next();
  };
}

/** Any signed-in user (admin, staff, or customer). */
export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    next(ApiError.unauthorized());
    return;
  }
  next();
};

/** Admin + staff — i.e. back-office users, not customers. */
export const requireStaff: RequestHandler = requireRole('admin', 'staff');

/** Admin only. */
export const requireAdmin: RequestHandler = requireRole('admin');
