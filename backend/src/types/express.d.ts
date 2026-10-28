import type { AuthUser } from './index';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Populated by the `authenticate` middleware. */
      user?: AuthUser;
      /** Populated by the CSRF middleware. */
      csrfToken?: string;
      /** Raw request body before sanitisation — kept for audit logging. */
      rawBody?: unknown;
    }
  }
}

export {};
