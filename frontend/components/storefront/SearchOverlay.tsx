'use client';

/**
 * Full-width search overlay.
 *
 * It sits above the whole page (including the fixed header) so the input is
 * always in the same place regardless of scroll. Suggestions are debounced and
 * rendered from the same public browse feed as the catalogue.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Loader2, Search, X } from 'lucide-react';
import { useStoreUI } from '@/components/providers/StoreUIProvider';
import { imageUrl } from '@/lib/api';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Category, Product } from '@/types';

const POPULAR = ['Sofa', 'Oak dining', 'Linen bed', 'Floor lamp', 'Outdoor'];

export function SearchOverlay({ categories }: { categories: Category[] }) {
  const { searchOpen, closeSearch } = useStoreUI();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const roots = categories.filter((category) => !category.parent_id).slice(0, 7);

  useEffect(() => {
    if (!searchOpen) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, closeSearch]);

  // Live suggestions. The timer is the debounce; the cleanup cancels a
  // response that lands after the query changed.
  useEffect(() => {
    const term = query.trim();
    if (!searchOpen || term.length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await api.list<Product>('/products/browse', {
          search: term,
          pageSize: 6,
          sortBy: 'id',
          sortDir: 'desc',
        });
        if (!cancelled) setResults(response.data);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSearched(true);
        }
      }
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, searchOpen]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/products?search=${encodeURIComponent(term)}` : '/products');
    closeSearch();
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[75]',
        searchOpen ? 'visible' : 'invisible pointer-events-none'
      )}
      aria-hidden={!searchOpen}
    >
      <div
        className={cn(
          'absolute inset-0 bg-walnut-950/45 backdrop-blur-[2px] transition-opacity duration-300',
          searchOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closeSearch}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the catalogue"
        className={cn(
          'absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto bg-sand-50 shadow-[0_30px_90px_-30px_rgba(22,19,15,0.4)] transition-all duration-300 ease-out',
          searchOpen ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'
        )}
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 sm:py-9">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-clay-700">
              Search Lumera
            </p>
            <button
              type="button"
              aria-label="Close search"
              onClick={closeSearch}
              className="flex size-9 items-center justify-center rounded-full border border-sand-300 text-sand-600 transition-colors hover:border-walnut-900 hover:text-walnut-900"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={submit} role="search">
            <div className="flex items-center gap-3 border-b border-walnut-900/80 pb-3 sm:gap-4">
              <Search className="size-5 shrink-0 text-walnut-900 sm:size-6" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="What are you looking for?"
                aria-label="What are you looking for?"
                className="min-w-0 flex-1 bg-transparent font-display text-2xl text-walnut-950 placeholder:text-sand-400/90 focus:outline-none sm:text-4xl"
              />
              <button
                type="submit"
                className="hidden shrink-0 items-center gap-2 rounded-full bg-walnut-950 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-clay-700 sm:inline-flex"
              >
                Search
                <ArrowRight className="size-3.5" />
              </button>
              <button
                type="submit"
                aria-label="Search"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-walnut-950 text-white sm:hidden"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-sand-500">
              Shop by category
            </span>
            {roots.map((category) => (
              <Link
                key={category.id}
                href={`/products/${category.slug}`}
                onClick={closeSearch}
                className="rounded-full border border-sand-200 bg-sand-50 px-3 py-1.5 text-xs font-medium text-sand-700 transition-colors hover:border-clay-300 hover:bg-clay-50 hover:text-clay-800"
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="mt-6 border-t border-sand-200 pt-5">
            {query.trim().length < 2 ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-sand-500">Popular right now</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {POPULAR.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="text-sm text-walnut-900 underline decoration-sand-300 underline-offset-4 transition-colors hover:text-clay-700"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <p className="flex items-center gap-2 py-4 text-sm text-sand-500">
                <Loader2 className="size-4 animate-spin" />
                Looking through the collection…
              </p>
            ) : results.length > 0 ? (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-sand-500">
                    Live suggestions
                  </p>
                  <Link
                    href={`/products?search=${encodeURIComponent(query.trim())}`}
                    onClick={closeSearch}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-clay-700 hover:text-clay-800"
                  >
                    See all results
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>

                <div className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={closeSearch}
                      className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-sand-100"
                    >
                      <span className="size-14 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                        {product.primary_image ? (
                          <img
                            src={imageUrl(product.primary_image)}
                            alt=""
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-walnut-950">
                          {product.name}
                        </span>
                        <span className="mt-0.5 block text-[0.7rem] text-sand-500">
                          {product.category_name}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-clay-700">
                        {formatMoney(
                          product.on_sale && product.sale_price ? product.sale_price : product.price,
                          'PHP',
                          { decimals: 0 }
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : searched ? (
              <div className="py-2">
                <p className="text-sm text-sand-600">
                  No pieces matched “{query.trim()}”. Try a broader term, or browse a category above.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
