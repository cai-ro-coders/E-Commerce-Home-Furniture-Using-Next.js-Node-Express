'use client';

/**
 * All collections.
 *
 * `/products` and `/products/[categorySlug]` share one view so filters, card
 * behaviour and pagination stay identical whether a visitor is browsing the
 * whole catalogue or a single room.
 */
import { use } from 'react';
import { CollectionView } from '@/components/storefront/CollectionView';
import { StoreShell } from '@/components/storefront/StoreShell';

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = use(searchParams);

  return (
    <StoreShell>
      <CollectionView query={query} />
    </StoreShell>
  );
}
