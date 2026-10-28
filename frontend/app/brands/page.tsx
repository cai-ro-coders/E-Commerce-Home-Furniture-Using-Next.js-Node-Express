'use client';

/**
 * Storefront brand directory.
 *
 * The header's "Brand" link lands here. Each card opens `/brands/[slug]`,
 * which reuses the shared collection view so sorting, filtering and pagination
 * behave exactly like the rest of the catalogue.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';
import { StoreShell } from '@/components/storefront/StoreShell';
import { ErrorState } from '@/components/ui/Feedback';
import { api, imageUrl } from '@/lib/api';
import type { Brand } from '@/types';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get<Brand[]>('/brands/all')
      .then((result) => {
        if (!cancelled) setBrands(result.filter((brand) => brand.status === 'active'));
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Could not load the brands');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StoreShell>
      <div className="flex flex-col gap-7">
        <header className="relative overflow-hidden rounded-[1.4rem] border border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
          <div
            className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-clay-200/45 blur-3xl dark:bg-clay-900/25"
            aria-hidden
          />
          <div className="relative px-5 py-8 sm:px-8 sm:py-10">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.68rem] text-muted">
              <Link href="/" className="transition-colors hover:text-clay-700 dark:hover:text-clay-400">
                Home
              </Link>
              <span className="text-sand-400">/</span>
              <span className="text-sand-700 dark:text-sand-300">Brands</span>
            </nav>

            <p className="mt-6 flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-clay-700 dark:text-clay-400">
              <Sparkles className="size-3.5" aria-hidden />
              The makers
            </p>
            <h1 className="mt-2.5 font-display text-3xl leading-[1.05] tracking-[-0.02em] text-walnut-950 dark:text-sand-50 sm:text-4xl lg:text-[2.9rem]">
              Shop by brand
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand-600 dark:text-sand-300">
              The studios and workshops behind the catalogue — each with its own material
              language, signature silhouettes and approach to making furniture last.
            </p>
            <p className="mt-4 text-xs text-muted">
              {loading
                ? 'Gathering the makers…'
                : `${brands.length} brand${brands.length === 1 ? '' : 's'} to explore`}
            </p>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="surface-card overflow-hidden">
                <div className="skeleton aspect-[16/9] rounded-none" />
                <div className="flex flex-col gap-2 p-5">
                  <div className="skeleton h-5 w-1/2" />
                  <div className="skeleton h-3.5 w-full" />
                  <div className="skeleton h-3.5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="surface-card">
            <ErrorState
              title="The brand directory could not load"
              description={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : brands.length === 0 ? (
          <div className="surface-card px-6 py-16 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--surface-sunken)] text-clay-600 dark:text-clay-400">
              <Tag className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl text-walnut-950 dark:text-sand-50">
              No brands yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
              The makers will appear here as soon as the studio adds them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group surface-card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-clay-300 hover:shadow-[var(--shadow-lift)] dark:hover:border-clay-700"
              >
                <div className="flex aspect-[16/9] items-center justify-center border-b border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-8">
                  {brand.logo ? (
                    <img
                      src={imageUrl(brand.logo)}
                      alt={brand.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="font-display text-4xl font-semibold text-sand-300 dark:text-walnut-700">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-xl font-semibold text-walnut-950 dark:text-sand-50">
                    {brand.name}
                  </h2>
                  {brand.description ? (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                      {brand.description}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      Considered furniture from this maker.
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
                    <span className="font-medium text-clay-700 dark:text-clay-400">
                      {brand.product_count ?? 0} product
                      {(brand.product_count ?? 0) === 1 ? '' : 's'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-sand-500 transition-colors group-hover:text-clay-700 dark:text-sand-400 dark:group-hover:text-clay-400">
                      Explore
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StoreShell>
  );
}
