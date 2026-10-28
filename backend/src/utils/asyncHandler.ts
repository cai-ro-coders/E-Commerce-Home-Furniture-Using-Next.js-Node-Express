import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ApiError } from './ApiError';

/**
 * Wraps an async handler so rejected promises reach Express' error pipeline
 * instead of hanging the request. Every async route handler uses this.
 */
export function asyncHandler<T extends RequestHandler>(handler: T): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

/** Parse and validate `req[source]` against a Zod schema, replacing it with the typed result. */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      // `req.query` and `req.params` are getter-only on Express 5, but on
      // Express 4 they are plain properties, so assignment is safe here.
      (req as unknown as Record<string, unknown>)[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          ApiError.unprocessable(
            'Validation failed',
            error.issues.map((issue) => ({
              field: issue.path.join('.') || '(root)',
              message: issue.message,
            }))
          )
        );
        return;
      }
      next(error);
    }
  };
}
