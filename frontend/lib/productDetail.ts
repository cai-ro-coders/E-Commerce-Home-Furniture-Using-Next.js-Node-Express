import { api } from '@/lib/api';
import type { Product } from '@/types';

/**
 * A tiny per-session cache for product detail reads.
 *
 * Cards need the second image for the hover swap and the quick view needs the
 * full description, but the browse feed deliberately only carries the primary
 * image. Fetching once per slug keeps hovering across a grid cheap.
 */
const cache = new Map<string, Promise<Product>>();

export function loadProductDetail(slug: string): Promise<Product> {
  const existing = cache.get(slug);
  if (existing) return existing;

  const request = api
    .get<Product>(`/products/browse/${encodeURIComponent(slug)}`)
    .catch((error: unknown) => {
      // A failure should not poison the cache for the rest of the visit.
      cache.delete(slug);
      throw error;
    });

  cache.set(slug, request);
  return request;
}
