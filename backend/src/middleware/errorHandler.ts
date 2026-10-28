import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { sanitizeDeep } from '../utils/sanitize';

/**
 * Global XSS sanitiser.
 *
 * Runs before every route so no handler has to remember to clean its input.
 * Applied to body, query and params; skipped on GET-only public reads where the
 * body is empty, purely as a small optimisation.
 */
export function xssSanitize(req: Request, _res: Response, next: NextFunction): void {
  if (!env.auth.xssSanitize) {
    next();
    return;
  }
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeDeep(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    // req.query is a getter in newer Express; assign defensively.
    try {
      (req as unknown as Record<string, unknown>).query = sanitizeDeep(req.query);
    } catch {
      /* readonly getter — validated values are sanitised by the validators anyway */
    }
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeDeep(req.params);
  }
  next();
}

/** Reject the request when the JSON body exceeds the configured limit. */
export function bodySizeLimit(bytes: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const length = Number(req.headers['content-length'] ?? 0);
    if (length > bytes) {
      next(ApiError.badRequest(`Request body exceeds the ${bytes} byte limit`));
      return;
    }
    next();
  };
}

/**
 * Central error handler. Converts anything thrown anywhere in the stack into
 * the standard error envelope, and never leaks internals in production.
 */
export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details: unknown = undefined;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = error.issues.map((issue) => ({
      field: issue.path.join('.') || '(root)',
      message: issue.message,
    }));
  } else if (isMulterError(error)) {
    statusCode = 400;
    code = 'UPLOAD_ERROR';
    message = multerMessage(error.code);
  } else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Request body is not valid JSON';
  } else if (isDuplicateEntryError(error)) {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'A record with that unique value already exists';
  } else if (isForeignKeyError(error)) {
    statusCode = 409;
    code = 'FK_CONSTRAINT';
    message =
      'This record is referenced by other records and cannot be removed, or references a record that does not exist';
  }

  // Log server-side faults; 4xx is the client's problem and would only be noise.
  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(`[error] ${req.method} ${req.originalUrl}`, error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: { code, details },
    ...(env.isProduction ? {} : { stack: statusCode >= 500 ? (error as Error)?.stack : undefined }),
  });
};

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`));
}

interface DriverError extends Error {
  code?: string;
  errno?: number;
}

function isMulterError(error: unknown): error is DriverError {
  return (
    error instanceof Error &&
    ['LIMIT_FILE_SIZE', 'LIMIT_FILE_COUNT', 'LIMIT_UNEXPECTED_FILE'].includes(
      (error as DriverError).code ?? ''
    )
  );
}

function multerMessage(code?: string): string {
  switch (code) {
    case 'LIMIT_FILE_SIZE':
      return 'Uploaded file is too large';
    case 'LIMIT_FILE_COUNT':
      return 'Too many files in a single upload';
    case 'LIMIT_UNEXPECTED_FILE':
      return 'Unexpected file field';
    default:
      return 'File upload failed';
  }
}

function isDuplicateEntryError(error: unknown): boolean {
  return (error as DriverError)?.code === 'ER_DUP_ENTRY' || (error as DriverError)?.errno === 1062;
}

function isForeignKeyError(error: unknown): boolean {
  return (error as DriverError)?.code === 'ER_NO_REFERENCED_ROW_2' || (error as DriverError)?.errno === 1452;
}
