import type { ApiEnvelope, ListParams, Paginated } from '@/types';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(
  /\/+$/,
  ''
);

export const UPLOADS_URL = (process.env.NEXT_PUBLIC_UPLOADS_URL ?? 'http://localhost:4000').replace(
  /\/+$/,
  ''
);

/** A failed request, carrying the server's code and per-field messages. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  /** Field-level messages, present when the error came from validation. */
  readonly details: Array<{ field: string; message: string }>;
  /**
   * Extra payload a handler attached to the error, e.g. the brand-delete
   * 400's `{ product_count, allow_force }`. The API's `error.details` is either
   * a field/message array or a plain object, so the two are split on the way in.
   */
  readonly meta: Record<string, unknown>;

  constructor(
    status: number,
    message: string,
    code = 'ERROR',
    details?: Array<{ field: string; message: string }> | Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = Array.isArray(details) ? details : [];
    this.meta = details && !Array.isArray(details) ? details : {};
  }

  /** Field -> message map, ready to drop into a form's error state. */
  get fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const detail of this.details) out[detail.field] = detail.message;
    return out;
  }

  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }
}

/* ----------------------------------------------------------- CSRF + tokens */

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function csrfToken(): string {
  return readCookie('csrf_token') ?? '';
}

/* ------------------------------------------------------------ core request */

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skip the automatic refresh-and-retry on a 401. */
  skipRefresh?: boolean;
  /** Let the caller receive the raw `Response` (downloads, blobs). */
  raw?: boolean;
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * One shared in-flight refresh. A page that fires six requests after the access
 * token expires must not trigger six rotations — the first rotation invalidates
 * the refresh token the other five are holding.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'x-csrf-token': csrfToken(), 'Content-Type': 'application/json' },
        });
        return response.ok;
      } catch {
        return false;
      } finally {
        // Release the slot on the next tick so simultaneous callers all await it.
        setTimeout(() => {
          refreshInFlight = null;
        }, 0);
      }
    })();
  }
  return refreshInFlight;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipRefresh, raw, headers, ...rest } = options;
  const method = (rest.method ?? 'GET').toUpperCase();

  const finalHeaders = new Headers(headers);
  if (!SAFE_METHODS.has(method)) finalHeaders.set('x-csrf-token', csrfToken());
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  finalHeaders.set('Accept', 'application/json');

  const send = (): Promise<Response> =>
    fetch(`${API_URL}${path}`, {
      ...rest,
      method,
      credentials: 'include',
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    });

  let response: Response;
  try {
    response = await send();
  } catch {
    throw new ApiError(
      0,
      'Cannot reach the server. Check that the API is running and try again.',
      'NETWORK_ERROR'
    );
  }

  // Expired access token: refresh once, then replay the original request.
  if (response.status === 401 && !skipRefresh && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession();
    if (refreshed) {
      try {
        response = await send();
      } catch {
        throw new ApiError(0, 'Cannot reach the server.', 'NETWORK_ERROR');
      }
    }
  }

  if (raw) {
    if (!response.ok) throw await toApiError(response);
    return response as unknown as T;
  }

  // 204 No Content has no body to parse.
  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    if (payload?.error) {
      throw new ApiError(
        response.status,
        payload.message || 'Something went wrong',
        payload.error.code,
        payload.error.details
      );
    }
    throw new ApiError(response.status, 'Something went wrong', 'ERROR');
  }

  // List endpoints put pagination in `meta`; fold it back into one object so
  // callers always receive `{ data, meta }`.
  if (payload.meta) {
    return { data: payload.data, meta: payload.meta } as unknown as T;
  }

  return payload.data;
}

async function toApiError(response: Response): Promise<ApiError> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<unknown> | null;
  return new ApiError(
    response.status,
    payload?.message ?? response.statusText,
    payload?.error?.code ?? 'ERROR',
    payload?.error?.details ?? []
  );
}

/* --------------------------------------------------------------- sugar API */

function withQuery(path: string, params?: ListParams): string {
  if (!params) return path;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export const api = {
  get: <T>(path: string, params?: ListParams) =>
    request<T>(withQuery(path, params), { method: 'GET' }),

  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),

  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),

  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),

  /** A paginated list. Identical to `get` but names the intent. */
  list: <T>(path: string, params?: ListParams) => request<Paginated<T>>(withQuery(path, params)),

  /** Multipart upload — the browser sets the boundary, so no Content-Type. */
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', body: form }),

  /** Fetch a file (CSV/JSON export, receipt) as a blob for a download. */
  download: (path: string, params?: ListParams) =>
    request<Response>(withQuery(path, params), { raw: true }),
};

/* ------------------------------------------------------------- image paths */

/**
 * Resolve a stored image path to a browser URL.
 *
 * The API stores uploads as `/uploads/products/xyz.svg`; the frontend runs on a
 * different origin, so those need the API host prepended. Absolute URLs and
 * data URIs are passed through untouched.
 */
export function imageUrl(path?: string | null): string {
  if (!path) return '/placeholder.svg';
  if (/^(https?:)?\/\//i.test(path)) return path;
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;
  return `${UPLOADS_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
