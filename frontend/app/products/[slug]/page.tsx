'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import { CollectionView, type CollectionQuery } from '@/components/storefront/CollectionView';
import { ProductCard } from '@/components/storefront/ProductCard';
import { StoreShell, useStorefrontData } from '@/components/storefront/StoreShell';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { useStore } from '@/components/providers/StoreProvider';
import { api, imageUrl } from '@/lib/api';
import { discountLabel, formatMoney, formatNumber, num } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Product } from '@/types';

/**
 * One dynamic segment hosts two storefront destinations:
 *
 *   /products/sofas-sectionals  → the category's collection
 *   /products/bergen-3-seater   → the product detail page
 *
 * Category slugs are checked first against the navigation tree the shell has
 * already loaded; everything else is treated as a product slug.
 */
export default function ProductSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = use(params);
  const query = use(searchParams);

  return (
    <StoreShell>
      <SlugContent slug={slug} query={query} />
    </StoreShell>
  );
}

function SlugContent({ slug, query }: { slug: string; query: CollectionQuery }) {
  const { categories } = useStorefrontData();
  const category = categories.find((entry) => entry.slug === slug);

  if (category) return <CollectionView query={query} category={category} />;

  return <ProductDetailView slug={slug} />;
}

function ProductDetailView({ slug }: { slug: string }) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const { categories } = useStorefrontData();

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setImageIndex(0);
    setQuantity(1);
    try {
      setProduct(await api.get<Product>(`/products/browse/${slug}`));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load that product');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <PageSpinner label="Loading product…" />;
  }

  if (error || !product) {
    return (
      <Card>
        <CardBody>
          <ErrorState
            title="That product is not available"
            description={error ?? undefined}
            onRetry={() => void load()}
          />
        </CardBody>
      </Card>
    );
  }

  const images = product.images?.length ? product.images : product.primary_image
    ? [{ id: 0, product_id: product.id, image: product.primary_image, is_primary: 1, sort_order: 0 }]
    : [];
  const image = images[Math.min(imageIndex, images.length - 1)]?.image ?? product.primary_image;
  const wished = isWishlisted(product.id);
  const out = product.stock_quantity <= 0;
  const sale = product.on_sale && product.sale_price !== null;
  const avg = product.avg_rating ? num(product.avg_rating) : null;
  const categorySlug = categories.find((entry) => entry.id === product.category_id)?.slug;

  const add = async () => {
    setAdding(true);
    const ok = await addToCart(product.id, quantity, product.name);
    setAdding(false);
    if (ok) {
      // Bounce the quantity back so adding the same piece twice is a decision.
      setQuantity(1);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <Link
        href="/products"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-sand-600 transition-colors hover:text-clay-700 dark:text-sand-300"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back to the catalogue
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* ------------------------------------------------------ gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--surface-sunken)]">
              {image ? (
                <img
                  src={imageUrl(image)}
                  alt={product.name}
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center font-display text-6xl font-bold text-sand-300 dark:text-walnut-700">
                  {product.name.charAt(0)}
                </span>
              )}

              {sale ? (
                <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Save {discountLabel(product.price, product.sale_price)}
                </span>
              ) : null}

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => setImageIndex((index) => (index - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => setImageIndex((index) => (index + 1) % images.length)}
                    className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((entry, index) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    aria-label={`Image ${index + 1}`}
                    aria-current={index === imageIndex}
                    className={cn(
                      'size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                      index === imageIndex
                        ? 'border-clay-600'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={imageUrl(entry.image)} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* -------------------------------------------------------- info */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {product.category_name ? (
                  <Link
                    href={categorySlug ? `/products/${categorySlug}` : `/products?category=${product.category_id}`}
                    className="text-xs font-semibold uppercase tracking-wider text-clay-700 hover:underline dark:text-clay-400"
                  >
                    {product.category_name}
                  </Link>
                ) : null}
                {product.brand_name ? (
                  <Link
                    href={`/products?brand=${product.brand_id}`}
                    className="text-xs font-semibold uppercase tracking-wider text-sand-500 hover:underline dark:text-sand-400"
                  >
                    {product.brand_name}
                  </Link>
                ) : null}
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-sand-900 dark:text-sand-50">
                {product.name}
              </h1>
              <p className="mt-1 text-xs text-muted">SKU {product.sku}</p>
            </div>

            {avg !== null ? (
              <div className="flex items-center gap-2">
                <StarRating value={avg} />
                <span className="text-sm font-semibold tabular-nums">{avg.toFixed(1)}</span>
                <span className="text-sm text-muted">
                  · {formatNumber(product.review_count ?? 0)} review
                  {(product.review_count ?? 0) === 1 ? '' : 's'}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted">No reviews yet.</p>
            )}

            <div className="flex items-baseline gap-3">
              {sale ? (
                <>
                  <span className="font-display text-3xl font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                    {formatMoney(product.sale_price, 'PHP')}
                  </span>
                  <span className="text-lg tabular-nums text-muted line-through">
                    {formatMoney(product.price, 'PHP')}
                  </span>
                </>
              ) : (
                <span className="font-display text-3xl font-semibold tabular-nums text-sand-900 dark:text-sand-50">
                  {formatMoney(product.price, 'PHP')}
                </span>
              )}
            </div>

            {product.short_description ? (
              <p className="text-sm leading-relaxed text-sand-700 dark:text-sand-200">
                {product.short_description}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              {out ? (
                <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                  Out of stock
                </Badge>
              ) : product.stock_quantity <= (product.minimum_stock || 5) ? (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                  Only {product.stock_quantity} left
                </Badge>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  In stock
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-[var(--border-subtle)]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="flex size-11 items-center justify-center rounded-l-full text-sand-500 transition-colors hover:bg-[var(--surface-sunken)]"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((value) => Math.min(product.stock_quantity || 1, value + 1))}
                  className="flex size-11 items-center justify-center rounded-r-full text-sand-500 transition-colors hover:bg-[var(--surface-sunken)]"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <Button
                leftIcon={<ShoppingCart className="size-4" />}
                loading={adding}
                disabled={out}
                onClick={() => void add()}
                className="flex-1 sm:flex-none sm:px-8"
              >
                {out ? 'Out of stock' : 'Add to cart'}
              </Button>

              <button
                type="button"
                aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={wished}
                onClick={() => void toggleWishlist(product.id)}
                className={cn(
                  'flex size-11 items-center justify-center rounded-full border transition-colors',
                  wished
                    ? 'border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-500/30 dark:bg-rose-500/10'
                    : 'border-[var(--border-subtle)] text-sand-500 hover:border-rose-300 hover:text-rose-500'
                )}
              >
                <Heart className={cn('size-4.5', wished && 'fill-current')} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-4 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-2.5">
                <Truck className="size-4.5 shrink-0 text-clay-600 dark:text-clay-400" aria-hidden />
                <span className="text-xs leading-snug text-sand-700 dark:text-sand-200">
                  ₱250 delivery, free over ₱25,000
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-4.5 shrink-0 text-clay-600 dark:text-clay-400" aria-hidden />
                <span className="text-xs leading-snug text-sand-700 dark:text-sand-200">
                  Solid wood, built to last
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="size-4.5 shrink-0 text-clay-600 dark:text-clay-400" aria-hidden />
                <span className="text-xs leading-snug text-sand-700 dark:text-sand-200">
                  7-day change of mind
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------- description & specs */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="About this piece" />
            <CardBody>
              {product.description ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-sand-700 dark:text-sand-200">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-muted">
                  No written description yet — the photos and the specifications tell the story.
                </p>
              )}

              {product.dimensions || product.weight ? (
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border-subtle)] pt-5 sm:grid-cols-3">
                  {product.dimensions ? (
                    <div>
                      <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
                        Dimensions
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-sand-800 dark:text-sand-100">
                        {product.dimensions}
                      </dd>
                    </div>
                  ) : null}
                  {product.weight ? (
                    <div>
                      <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
                        Weight
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-sand-800 dark:text-sand-100">
                        {product.weight}
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">SKU</dt>
                    <dd className="mt-1 font-mono text-sm font-medium text-sand-800 dark:text-sand-100">
                      {product.sku}
                    </dd>
                  </div>
                </dl>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Specifications" />
            <CardBody className="p-0">
              {product.specifications?.length ? (
                <dl className="divide-y divide-[var(--border-subtle)]">
                  {product.specifications.map((spec) => (
                    <div key={spec.id} className="flex items-start justify-between gap-4 px-5 py-3">
                      <dt className="text-xs text-muted">{spec.attribute_name}</dt>
                      <dd className="text-right text-xs font-medium text-sand-800 dark:text-sand-100">
                        {spec.attribute_value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-muted">
                  No specifications listed.
                </p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* ------------------------------------------------------ reviews */}
        <Card>
          <CardHeader
            title={`Customer reviews (${formatNumber(product.review_count ?? 0)})`}
            description="Only approved reviews are shown."
          />
          <CardBody className="p-0">
            {product.reviews && product.reviews.length > 0 ? (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {product.reviews.map((review) => (
                  <li key={review.id} className="flex items-start gap-3.5 px-5 py-4">
                    <Avatar src={review.user_avatar} name={review.user_name ?? 'Customer'} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-sand-900 dark:text-sand-50">
                          {review.user_name ?? 'Verified buyer'}
                        </span>
                        <StarRating value={review.rating} size="sm" />
                      </div>
                      {review.title ? (
                        <p className="mt-1 text-sm font-medium text-sand-800 dark:text-sand-100">
                          {review.title}
                        </p>
                      ) : null}
                      {review.comment ? (
                        <p className="mt-1 text-sm leading-relaxed text-muted">{review.comment}</p>
                      ) : null}
                      <p className="mt-1.5 text-xs text-muted">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-muted">
                No reviews yet. Be the first to tell us how it fits your home.
              </p>
            )}
          </CardBody>
        </Card>

        {/* ------------------------------------------------------ related */}
        {product.related && product.related.length > 0 ? (
          <section>
            <h2 className="font-display text-xl font-semibold text-sand-900 dark:text-sand-50">
              You may also like
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {product.related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
    </div>
  );
}
