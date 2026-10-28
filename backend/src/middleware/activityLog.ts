import type { NextFunction, Request, Response } from 'express';
import { execute } from '../config/database';

export type ActivityAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'create'
  | 'update'
  | 'delete'
  | 'password_change'
  | 'password_reset'
  | 'export'
  | 'status_change';

interface LogOptions {
  action: ActivityAction;
  entity?: string;
  entityId?: number | string | null;
  description?: string;
  /** Fire-and-forget: never block the response on the audit write. */
  async?: boolean;
}

/**
 * Write a row to `user_activities`. Used by the back-office activity log and
 * by the auth flow. Failures are swallowed: audit logging must never turn a
 * successful business operation into a 500.
 */
export function logActivity(req: Request, userId: number, options: LogOptions): void {
  const ipAddress = req.ip ?? null;
  const userAgent = (req.headers['user-agent'] as string | undefined)?.slice(0, 255) ?? null;

  const run = execute(
    `INSERT INTO user_activities (user_id, action, entity, entity_id, description, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      options.action,
      options.entity ?? null,
      options.entityId ?? null,
      options.description ?? null,
      ipAddress,
      userAgent,
    ]
  ).catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('[activity-log] failed to record activity', error);
  });

  if (options.async === false) return;
  void run;
}

/** Express middleware factory for straightforward "entity was mutated" logging. */
export function activityLogger(options: Omit<LogOptions, 'async'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      if (!req.user || res.statusCode >= 400) return;
      const entityId = (req.params?.id as string | undefined) ?? null;
      logActivity(req, req.user.id, {
        ...options,
        entityId: options.entityId ?? entityId,
      });
    });
    next();
  };
}
