'use client';

/**
 * The storefront home page.
 *
 * The shell already has the category tree, so the page itself only fetches the
 * catalogue and the public brand list. Everything below the hero is derived
 * from that one product response — sale, new arrivals, featured and the weekly
 * deal — which keeps the page to two requests.
 */
import { useEffect, useMemo, useState } from 'react';
import { StoreShell, useStorefrontData } from '@/components/storefront/StoreShell';
import { FeaturedBanner } from '@/components/storefront/home/FeaturedBanner';
import { BrandStrip } from '@/components/storefront/home/BrandStrip';
import { CategoryShowcase } from '@/components/storefront/home/CategoryShowcase';
import { FeatureStrip } from '@/components/storefront/home/FeatureStrip';
import { Hero } from '@/components/storefront/home/Hero';
import { NewArrivals } from '@/components/storefront/home/NewArrivals';
import { PromoStory } from '@/components/storefront/home/PromoStory';
import { SaleGrid } from '@/components/storefront/home/SaleGrid';
import { Testimonials } from '@/components/storefront/home/Testimonials';
import { TopDeal } from '@/components/storefront/home/TopDeal';
import { api } from '@/lib/api';
import { num } from '@/lib/format';
import { scrollToHash } from '@/lib/scroll';
import type { Brand, Product } from '@/types';

export default function HomePage() {
  return (
    <StoreShell fullBleed>
      <HomeContent />
    </StoreShell>
  );
}

function HomeContent() {
  const { tree } = useStorefrontData();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catalogue, makers] = await Promise.all([
          api.list<Product>('/products/browse', {
            page: 1,
            pageSize: 100,
            sortBy: 'id',
            sortDir: 'desc',
          }),
          api.get<Brand[]>('/brands/all'),
        ]);
        if (cancelled) return;
        setProducts(catalogue.data);
        setBrands(makers);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Could not load the collection');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Deep links such as /#brands can arrive from /products. Wait for the
  // catalogue and maker data so the sections above the target have their final
  // height before scrolling into place.
  useEffect(() => {
    if (loading) return;
    const timer = window.setTimeout(() => {
      scrollToHash();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const saleCandidates = useMemo(
    () =>
      products
        .filter((product) => product.on_sale && product.sale_price !== null)
        .sort((a, b) => discountOf(b) - discountOf(a)),
    [products]
  );

  // A product with a gallery gives the grid its hover swap and gives the deal
  // block a second view. Put the richest listing first, then the best discounts.
  const sale = useMemo(() => {
    const withGallery = saleCandidates.filter((product) => (product.image_count ?? 1) > 1);
    return [...withGallery.slice(0, 1), ...saleCandidates]
      .filter((product, index, all) => all.findIndex((item) => item.id === product.id) === index)
      .slice(0, 8);
  }, [saleCandidates]);

  const newArrivals = useMemo(() => products.slice(0, 4), [products]);

  const featured = useMemo(
    () => products.filter((product) => Boolean(product.featured)).slice(0, 3),
    [products]
  );

  // The featured deal is the best-discounted piece that also has a gallery, so
  // the editorial card has more than one photograph to work with. Fall back to
  // the top discount when no gallery exists.
  const deal = useMemo(() => {
    const withGallery = saleCandidates.filter((product) => (product.image_count ?? 1) > 1);
    return withGallery[0] ?? saleCandidates[0] ?? null;
  }, [saleCandidates]);

  return (
    <>
      <Hero />
      <FeatureStrip />

      {error ? (
        <div className="mx-auto max-w-[1400px] px-5 pt-8 sm:px-8 lg:px-10">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}. The collection will appear once the API is reachable.
          </p>
        </div>
      ) : null}

      <CategoryShowcase categories={tree} />
      <SaleGrid products={sale} loading={loading} />
      <PromoStory />
      <NewArrivals products={newArrivals} loading={loading} />
      <TopDeal product={deal} loading={loading} />
      <FeaturedBanner products={featured} />
      <BrandStrip brands={brands} />
      <Testimonials />
    </>
  );
}

function discountOf(product: Product): number {
  const price = num(product.price);
  const salePrice = num(product.sale_price);
  if (price <= 0 || salePrice <= 0 || salePrice >= price) return 0;
  return (price - salePrice) / price;
}
