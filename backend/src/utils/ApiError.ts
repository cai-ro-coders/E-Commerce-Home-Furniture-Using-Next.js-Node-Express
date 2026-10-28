/**
 * Operational error carrying an HTTP status code. Anything thrown that is *not*
 * an ApiError is treated as an unexpected bug and reported as a 500.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational = true;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code ?? defaultCodeFor(statusCode);
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', details?: unknown) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }
  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }
  static forbidden(message = 'You do not have permission to perform this action') {
    return new ApiError(403, message, 'FORBIDDEN');
  }
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }
  static conflict(message = 'Resource already exists', details?: unknown) {
    return new ApiError(409, message, 'CONFLICT', details);
  }
  static unprocessable(message = 'Validation failed', details?: unknown) {
    return new ApiError(422, message, 'VALIDATION_ERROR', details);
  }
  static tooMany(message = 'Too many requests') {
    return new ApiError(429, message, 'TOO_MANY_REQUESTS');
  }
  static internal(message = 'Internal server error', details?: unknown) {
    return new ApiError(500, message, 'INTERNAL_ERROR', details);
  }
}

function defaultCodeFor(statusCode: number): string {
  const map: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_ERROR',
  };
  return map[statusCode] ?? 'ERROR';
}
