'use client';

/**
 * Products from one maker.
 *
 * There is no public brand-by-slug endpoint, so the directory feed is fetched
 * and the matching brand handed to the shared `CollectionView`. That keeps the
 * page's filters, sorting, pagination and card behaviour identical to
 * `/products` and the category collections.
 */
import { use, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CollectionView } from '@/components/storefront/CollectionView';
import { StoreShell } from '@/components/storefront/StoreShell';
import { LinkButton } from '@/components/ui/Button';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { api } from '@/lib/api';
import type { Brand } from '@/types';

export default function BrandProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = use(params);
  const query = use(searchParams);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setBrand(null);
    setLoading(true);
    setMissing(false);
    setError(null);

    api
      .get<Brand[]>('/brands/all')
      .then((result) => {
        if (cancelled) return;
        const match = result.find((entry) => entry.slug === slug && entry.status === 'active');
        if (!match) {
          setMissing(true);
          return;
        }
        setBrand(match);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Could not load this brand');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <StoreShell>
        <PageSpinner label="Loading the maker…" />
      </StoreShell>
    );
  }

  if (!brand) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-xl py-8">
          <div className="surface-card overflow-hidden">
            <ErrorState
              title={missing ? 'That brand could not be found' : 'This brand could not load'}
              description={
                missing
                  ? 'The maker may have been renamed or is no longer in the directory.'
                  : error ?? 'Something went wrong while loading this brand.'
              }
            />
            <div className="flex justify-center pb-7">
              <LinkButton href="/brands" variant="outline">
                <ArrowLeft className="size-4" aria-hidden />
                All brands
              </LinkButton>
            </div>
          </div>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <CollectionView query={query} brand={brand} />
    </StoreShell>
  );
}
