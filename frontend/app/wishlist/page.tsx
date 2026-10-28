'use client';

import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { StoreShell } from '@/components/storefront/StoreShell';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState, PageSpinner } from '@/components/ui/Feedback';
import { useStore } from '@/components/providers/StoreProvider';
import { formatNumber } from '@/lib/format';

export default function WishlistPage() {
  const { wishlist, wishlistLoading, addToCart } = useStore();

  if (wishlistLoading) {
    return (
      <StoreShell>
        <PageSpinner label="Loading your wishlist…" />
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-sand-900 dark:text-sand-50">
            Your wishlist
          </h1>
          <p className="mt-1 text-sm text-muted">
            {wishlist.length === 0
              ? 'Pieces you are thinking about.'
              : `${formatNumber(wishlist.length)} piece${wishlist.length === 1 ? '' : 's'} saved.`}
          </p>
        </div>

        {wishlist.length === 0 ? (
          <Card>
            <CardBody>
              <EmptyState
                title="Nothing saved yet"
                description="Tap the heart on any product to keep it here for later."
                icon={<Heart className="size-8 text-sand-300 dark:text-walnut-700" />}
                action={
                  <Link href="/products">
                    <Button>Browse furniture</Button>
                  </Link>
                }
              />
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {wishlist.map((product) => (
              <div key={product.id} className="flex flex-col gap-3">
                <ProductCard product={product} />
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ShoppingCart className="size-3.5" />}
                  disabled={product.stock_quantity <= 0}
                  onClick={() => void addToCart(product.id, 1, product.name)}
                >
                  Move to cart
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreShell>
  );
}
