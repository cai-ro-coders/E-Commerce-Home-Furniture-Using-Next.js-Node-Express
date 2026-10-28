'use client';

/**
 * Storefront product card, editorial variant.
 *
 * Hovering asks for the product detail once so the second photograph can swap
 * in; products with a single image simply keep the gentle zoom. Quick view is
 * local to the card because only one modal can be open at a time.
 */
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Eye, Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { useStoreUI } from '@/components/providers/StoreUIProvider';
import { QuickViewModal } from '@/components/storefront/QuickViewModal';
import { StarRating } from '@/components/ui/Avatar';
import { imageUrl } from '@/lib/api';
import { discountLabel, formatMoney, num } from '@/lib/format';
import { loadProductDetail } from '@/lib/productDetail';
import { cn } from '@/lib/cn';
import type { Product } from '@/types';

export function PremiumProductCard({
  product,
  aspect = 'portrait',
  badge,
  showRating = true,
  layout = 'grid',
  variant = 'bare',
  priority = false,
}: {
  product: Product;
  aspect?: 'portrait' | 'square';
  badge?: string;
  showRating?: boolean;
  /** Collection pages offer a compact horizontal list view as well. */
  layout?: 'grid' | 'list';
  /** `card` adds the soft border, shadow and hover lift used on collection pages. */
  variant?: 'bare' | 'card';
  priority?: boolean;
}) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const { openCart } = useStoreUI();
  const [hoverImage, setHoverImage] = useState<string | null>(null);
  const [quickView, setQuickView] = useState(false);
  const [adding, setAdding] = useState(false);

  const wished = isWishlisted(product.id);
  const out = product.stock_quantity <= 0;
  const sale = product.on_sale && product.sale_price !== null;
  const discount = sale ? discountLabel(product.price, product.sale_price) : null;

  const onEnter = () => {
    if (hoverImage || (product.image_count ?? 1) < 2) return;
    void loadProductDetail(product.slug)
      .then((detail) => {
        const alternate = detail.images?.find((image) => !image.is_primary) ?? detail.images?.[1];
        if (alternate?.image) setHoverImage(alternate.image);
      })
      .catch(() => {
        // The primary image remains; a missing alternate is not an error.
      });
  };

  const add = async () => {
    setAdding(true);
    const ok = await addToCart(product.id, 1, product.name);
    setAdding(false);
    if (ok) openCart();
  };

  return (
    <>
      <article
        className={cn(
          'group/card relative flex flex-col',
          variant === 'card' &&
            'h-full rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-3 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]',
          layout === 'list' && 'sm:flex-row sm:items-stretch sm:gap-6'
        )}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-[1.05rem] bg-[#ece6dc] dark:bg-[var(--surface-sunken)]',
            layout === 'list'
              ? 'aspect-[4/3] w-full shrink-0 sm:aspect-[4/5] sm:w-60 lg:w-64'
              : aspect === 'portrait'
                ? 'aspect-[4/5]'
                : 'aspect-square'
          )}
          onMouseEnter={onEnter}
        >
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 z-[1]"
            aria-label={`View ${product.name}`}
          >
            {product.primary_image ? (
              <img
                src={imageUrl(product.primary_image)}
                alt={product.name}
                loading={priority ? 'eager' : 'lazy'}
                className="size-full object-cover transition-transform duration-[900ms] ease-out group-hover/card:scale-[1.045]"
              />
            ) : (
              <span className="flex size-full items-center justify-center font-display text-5xl font-semibold text-sand-300">
                {product.name.charAt(0)}
              </span>
            )}

            {hoverImage ? (
              <img
                src={imageUrl(hoverImage)}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
              />
            ) : null}
          </Link>

          <div className="absolute left-3 top-3 z-[2] flex flex-col items-start gap-1.5">
            {discount ? (
              <span className="rounded-full bg-[#9b4b36] px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                {discount}
              </span>
            ) : null}
            {badge ? (
              <span className="rounded-full bg-walnut-950/85 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                {badge}
              </span>
            ) : null}
            {out ? (
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-walnut-900 backdrop-blur">
                Sold out
              </span>
            ) : null}
          </div>

          <button
            type="button"
            aria-label={wished ? `Remove ${product.name} from your wishlist` : `Save ${product.name} to your wishlist`}
            aria-pressed={wished}
            onClick={() => void toggleWishlist(product.id)}
            className={cn(
              'absolute right-3 top-3 z-[2] flex size-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition-all duration-300',
              wished
                ? 'bg-white text-rose-500'
                : 'bg-white/85 text-walnut-900 hover:bg-white hover:text-rose-500'
            )}
          >
            <Heart className={cn('size-4', wished && 'fill-current')} />
          </button>

          <div className="absolute inset-x-3 bottom-3 z-[2] flex translate-y-0 items-center gap-2 opacity-100 transition-all duration-300 sm:pointer-events-none sm:translate-y-3 sm:opacity-0 sm:group-hover/card:pointer-events-auto sm:group-hover/card:translate-y-0 sm:group-hover/card:opacity-100 sm:group-focus-within/card:pointer-events-auto sm:group-focus-within/card:translate-y-0 sm:group-focus-within/card:opacity-100">
            <button
              type="button"
              onClick={() => setQuickView(true)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-white/95 text-xs font-semibold text-walnut-950 shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              <Eye className="size-3.5" />
              Quick view
            </button>
            <button
              type="button"
              disabled={out || adding}
              onClick={() => void add()}
              aria-label={`Add ${product.name} to bag`}
              className="flex size-10 items-center justify-center rounded-full bg-walnut-950 text-white transition-colors hover:bg-clay-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="size-4" />
            </button>
          </div>
        </div>

        <div
          className={cn(
            'flex flex-1 flex-col pt-4',
            layout === 'list' && 'sm:py-1 sm:pr-2',
            variant === 'card' && layout === 'grid' && 'px-1 pb-1'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-sand-500">
              {product.category_name ?? product.brand_name ?? 'Lumera Home'}
            </p>
            {showRating && num(product.avg_rating) > 0 ? (
              <StarRating value={product.avg_rating} size="sm" className="shrink-0" />
            ) : null}
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="mt-1.5 line-clamp-2 font-display text-[1.05rem] leading-snug text-walnut-950 transition-colors hover:text-clay-700 dark:text-sand-50 dark:hover:text-clay-400"
          >
            {product.name}
          </Link>

          {layout === 'list' && product.short_description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
              {product.short_description}
            </p>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-sm font-semibold tabular-nums',
                  sale
                    ? 'text-clay-700 dark:text-clay-400'
                    : 'text-walnut-950 dark:text-sand-50'
                )}
              >
                {formatMoney(sale ? product.sale_price : product.price, 'PHP', { decimals: 0 })}
              </span>
              {sale ? (
                <span className="text-xs text-sand-400 line-through">
                  {formatMoney(product.price, 'PHP', { decimals: 0 })}
                </span>
              ) : null}
            </div>
            <Link
              href={`/products/${product.slug}`}
              aria-label={`View ${product.name}`}
              className="flex size-7 items-center justify-center rounded-full border border-sand-300 text-sand-500 transition-all duration-300 hover:border-walnut-900 hover:bg-walnut-950 hover:text-white"
            >
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </article>

      {quickView ? <QuickViewModal product={product} onClose={() => setQuickView(false)} /> : null}
    </>
  );
}
