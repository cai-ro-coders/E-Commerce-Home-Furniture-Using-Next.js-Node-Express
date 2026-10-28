'use client';

/**
 * Quick view.
 *
 * The browse feed is intentionally light, so opening the modal fetches the
 * product's detail record once and caches it. The layout is deliberately the
 * same reading order as the product page: image, category, name, price,
 * description, actions.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ArrowUpRight, Heart, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { useStoreUI } from '@/components/providers/StoreUIProvider';
import { StarRating } from '@/components/ui/Avatar';
import { imageUrl } from '@/lib/api';
import { discountLabel, formatMoney, num } from '@/lib/format';
import { loadProductDetail } from '@/lib/productDetail';
import { cn } from '@/lib/cn';
import type { Product } from '@/types';

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const { openCart } = useStoreUI();
  const [detail, setDetail] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const slug = product?.slug;

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetail(null);
    setQuantity(1);

    loadProductDetail(slug)
      .then((result) => {
        if (!cancelled) setDetail(result);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Could not load this piece');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [product, onClose]);

  if (!product) return null;

  const shown = detail ?? product;
  // The detail endpoint returns the prices but not the list-only `on_sale`
  // flag, so derive the saving from the two amounts instead.
  const sale =
    shown.sale_price !== null &&
    shown.sale_price !== undefined &&
    Number(shown.sale_price) > 0 &&
    Number(shown.sale_price) < Number(shown.price);
  const wished = isWishlisted(shown.id);
  const out = shown.stock_quantity <= 0;
  const discount = sale ? discountLabel(shown.price, shown.sale_price) : null;

  const add = async () => {
    setAdding(true);
    const ok = await addToCart(shown.id, quantity, shown.name);
    setAdding(false);
    if (ok) {
      onClose();
      openCart();
    }
  };

  // Portal out of the card: the Reveal wrapper keeps a transform/will-change
  // for its entrance animation, which would otherwise make it the containing
  // block for this fixed overlay and trap the modal inside a single card.
  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-y-auto" role="dialog" aria-modal="true" aria-label={`Quick view: ${shown.name}`}>
      <div
        className="fixed inset-0 bg-walnut-950/55 backdrop-blur-[3px] animate-[fade-in_0.25s_ease-out_both]"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative mx-auto my-4 w-[calc(100%-2rem)] max-w-5xl animate-[rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both] overflow-hidden rounded-[1.5rem] bg-white shadow-[0_40px_120px_-40px_rgba(22,19,15,0.65)] sm:my-10">
        <button
          ref={closeRef}
          type="button"
          aria-label="Close quick view"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/90 text-walnut-900 shadow-sm backdrop-blur transition-colors hover:bg-white"
        >
          <X className="size-4.5" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#ece7df] md:aspect-auto md:min-h-[560px]">
            {shown.primary_image ? (
              <img
                src={imageUrl(shown.primary_image)}
                alt={shown.name}
                className="size-full object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center font-display text-6xl font-semibold text-sand-300">
                {shown.name.charAt(0)}
              </span>
            )}

            <div className="absolute left-5 top-5 flex flex-col gap-2">
              {discount ? (
                <span className="rounded-full bg-[#9b4b36] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white">
                  {discount} today
                </span>
              ) : null}
              {shown.featured ? (
                <span className="rounded-full bg-white/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-walnut-900 backdrop-blur">
                  Editor&apos;s pick
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col p-6 sm:p-9">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-clay-700">
              {shown.category_name ?? 'Lumera Home'}
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-walnut-950 sm:text-4xl">
              {shown.name}
            </h2>

            {num(shown.avg_rating) > 0 ? (
              <div className="mt-3 flex items-center gap-2">
                <StarRating value={shown.avg_rating} size="md" />
                <span className="text-xs text-sand-500">
                  {Number(shown.avg_rating).toFixed(1)} · {shown.review_count ?? 0} reviews
                </span>
              </div>
            ) : (
              <p className="mt-3 text-xs text-sand-500">New arrival · No reviews yet</p>
            )}

            <div className="mt-5 flex items-baseline gap-3">
              <span className={cn('font-display text-2xl', sale ? 'text-clay-700' : 'text-walnut-950')}>
                {formatMoney(sale ? shown.sale_price : shown.price, 'PHP', { decimals: 0 })}
              </span>
              {sale ? (
                <span className="text-sm text-sand-400 line-through">
                  {formatMoney(shown.price, 'PHP', { decimals: 0 })}
                </span>
              ) : null}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-sand-600">
              {shown.short_description ?? shown.description ?? 'A considered piece, made to be kept.'}
            </p>

            {shown.dimensions ? (
              <p className="mt-4 border-t border-sand-200 pt-4 text-xs text-sand-500">
                <span className="font-semibold uppercase tracking-[0.14em] text-sand-700">Dimensions </span>
                {shown.dimensions}
              </p>
            ) : null}

            <div className="mt-auto pt-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 items-center rounded-full border border-sand-300">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="flex size-11 items-center justify-center rounded-l-full text-sand-600 transition-colors hover:bg-sand-100 disabled:opacity-35"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={quantity >= shown.stock_quantity}
                    onClick={() => setQuantity((value) => Math.min(shown.stock_quantity, value + 1))}
                    className="flex size-11 items-center justify-center rounded-r-full text-sand-600 transition-colors hover:bg-sand-100 disabled:opacity-35"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={out || adding}
                  onClick={() => void add()}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-walnut-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-clay-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShoppingBag className="size-4" />
                  {out ? 'Sold out' : adding ? 'Adding…' : 'Add to bag'}
                </button>

                <button
                  type="button"
                  aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
                  aria-pressed={wished}
                  onClick={() => void toggleWishlist(shown.id)}
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-full border transition-colors',
                    wished
                      ? 'border-rose-200 bg-rose-50 text-rose-500'
                      : 'border-sand-300 text-sand-500 hover:border-rose-200 hover:text-rose-500'
                  )}
                >
                  <Heart className={cn('size-4.5', wished && 'fill-current')} />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-sand-500">
                  {out ? 'Currently unavailable' : `${shown.stock_quantity} in stock · ready to ship`}
                </p>
                <Link
                  href={`/products/${shown.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-walnut-900 underline decoration-sand-300 underline-offset-4 transition-colors hover:text-clay-700"
                >
                  Full details
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="border-t border-sand-200 px-6 py-2 text-[0.7rem] text-sand-400">
            Loading the full product record…
          </p>
        ) : error ? (
          <p className="border-t border-sand-200 px-6 py-2 text-[0.7rem] text-rose-600">{error}</p>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
