'use client';

/**
 * Product card used by the listing, the related-products rail and the
 * wishlist grid.
 *
 * The whole card is a link, with the wishlist heart and the add-to-cart button
 * as nested controls that stop propagation — a card that is only a link cannot
 * carry either without a page reload.
 */
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { imageUrl } from '@/lib/api';
import { discountLabel, formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Product } from '@/types';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const wished = isWishlisted(product.id);
  const out = product.stock_quantity <= 0;
  const sale = product.on_sale && product.sale_price !== null;

  return (
    <article className="group surface-card relative flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-[var(--surface-sunken)]"
        tabIndex={-1}
        aria-hidden
      >
        {product.primary_image ? (
          <img
            src={imageUrl(product.primary_image)}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-4xl font-display font-bold text-sand-300 dark:text-walnut-700">
            {product.name.charAt(0)}
          </span>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {sale ? (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
              {discountLabel(product.price, product.sale_price)}
            </span>
          ) : null}
          {product.featured ? (
            <span className="rounded-full bg-clay-600 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
              Featured
            </span>
          ) : null}
        </div>

        {out ? (
          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 text-center text-xs font-semibold uppercase tracking-wider text-white">
            Out of stock
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="min-w-0 font-medium leading-snug text-sand-900 hover:text-clay-700 dark:text-sand-50 dark:hover:text-clay-400"
          >
            <span className="line-clamp-2">{product.name}</span>
          </Link>
          <button
            type="button"
            aria-label={wished ? `Remove ${product.name} from your wishlist` : `Save ${product.name} to your wishlist`}
            aria-pressed={wished}
            onClick={() => void toggleWishlist(product.id)}
            className={cn(
              'shrink-0 rounded-full p-1.5 transition-colors',
              wished
                ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                : 'text-sand-400 hover:bg-[var(--surface-sunken)] hover:text-rose-500'
            )}
          >
            <Heart className={cn('size-4.5', wished && 'fill-current')} />
          </button>
        </div>

        {product.category_name ? (
          <p className="text-xs text-muted">{product.category_name}</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            {sale ? (
              <>
                <span className="text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400">
                  {formatMoney(product.sale_price, 'PHP')}
                </span>
                <span className="text-xs tabular-nums text-muted line-through">
                  {formatMoney(product.price, 'PHP')}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold tabular-nums text-sand-900 dark:text-sand-50">
                {formatMoney(product.price, 'PHP')}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={out}
            onClick={() => void addToCart(product.id, 1, product.name)}
            className={cn(
              'flex size-9 items-center justify-center rounded-full transition-colors',
              out
                ? 'cursor-not-allowed bg-[var(--surface-sunken)] text-sand-400'
                : 'bg-clay-600 text-white hover:bg-clay-700'
            )}
            aria-label={out ? `${product.name} is out of stock` : `Add ${product.name} to your cart`}
          >
            <ShoppingCart className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
