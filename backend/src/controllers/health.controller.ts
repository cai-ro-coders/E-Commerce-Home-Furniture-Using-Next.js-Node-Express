import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/ApiResponse';
import { queryOne } from '../config/database';
import { env } from '../config/env';
import type { RowDataPacket } from 'mysql2';

export const healthHandler = asyncHandler(async (_req: Request, res: Response) => {
  // A real DB round-trip: a 200 that never checked the database is worthless.
  const row = await queryOne<RowDataPacket & { ok: number }>('SELECT 1 AS ok');
  return ok(res, {
    status: Number(row?.ok) === 1 ? 'healthy' : 'degraded',
    database: Number(row?.ok) === 1 ? 'up' : 'down',
    environment: env.nodeEnv,
    uptime_seconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});
