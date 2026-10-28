'use client';

/**
 * The catalogue collection view, shared by `/products`, every
 * `/products/[categorySlug]` collection and every `/brands/[slug]` brand page.
 *
 * Filter state lives in the URL (`?brand=1,2&min_price=10000&rating=4&sort=price_asc`)
 * so a refined view can be bookmarked or shared. The visual hierarchy is
 * deliberately quiet: a sticky filter card on the left, a slim toolbar above
 * the grid, and cards that only lift when you engage with them.
 *
 * On a brand page the brand is implied by the path, so it is not written back
 * into the query string and the brand filter is hidden.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Grid2X2,
  LayoutList,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { PremiumProductCard } from '@/components/storefront/PremiumProductCard';
import { useStorefrontData } from '@/components/storefront/StoreShell';
import { StarRating } from '@/components/ui/Avatar';
import { Pagination } from '@/components/ui/Pagination';
import { api, imageUrl } from '@/lib/api';
import { formatMoney, formatNumber, num } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Brand, Category, PaginationMeta, Product } from '@/types';

const PAGE_SIZE = 12;

const SORTS = [
  { value: 'popular', label: 'Most popular', sortBy: 'review_count', sortDir: 'desc' },
  { value: 'rating', label: 'Best rating', sortBy: 'avg_rating', sortDir: 'desc' },
  { value: 'newest', label: 'Newest', sortBy: 'created_at', sortDir: 'desc' },
  { value: 'price_asc', label: 'Price: low to high', sortBy: 'effective_price', sortDir: 'asc' },
  { value: 'price_desc', label: 'Price: high to low', sortBy: 'effective_price', sortDir: 'desc' },
] as const;

type SortKey = (typeof SORTS)[number]['value'];

/** Editorial art for collections that have no uploaded banner of their own. */
const CATEGORY_ART: Record<string, string> = {
  'living-room': '/images/category-living.jpg',
  'sofas-sectionals': '/images/category-living.jpg',
  'coffee-tables': '/images/category-living.jpg',
  'tv-media-units': '/images/category-living.jpg',
  bedroom: '/images/category-bedroom.jpg',
  'beds-bed-frames': '/images/category-bedroom.jpg',
  mattresses: '/images/category-bedroom.jpg',
  'dining-room': '/images/category-dining.jpg',
  'kitchen-storage': '/images/category-dining.jpg',
  'office-study': '/images/category-office.jpg',
  'outdoor-patio': '/images/category-outdoor.jpg',
  'decor-lighting': '/images/category-decor.jpg',
  'kids-nursery': '/images/category-bedroom.jpg',
};

export type CollectionQuery = Record<string, string | string[] | undefined>;

export function CollectionView({
  query,
  category,
  brand,
}: {
  query: CollectionQuery;
  /** Present on a category collection, absent on `/products`. */
  category?: Category;
  /** Present on a brand collection (`/brands/[slug]`), absent elsewhere. */
  brand?: Brand;
}) {
  const router = useRouter();
  const { tree, categories } = useStorefrontData();

  const searchTerm = first(query.search) ?? '';
  const brandParam = first(query.brand) ?? '';
  const minPriceParam = first(query.min_price) ?? '';
  const maxPriceParam = first(query.max_price) ?? '';
  const ratingParam = first(query.rating) ?? '';
  const sortParam = first(query.sort);
  const page = Math.max(1, Number(first(query.page)) || 1);
  const view = first(query.view) === 'list' ? 'list' : 'grid';
  const onSale = first(query.on_sale) === 'true';
  const inStock = first(query.in_stock) === 'true';
  const featured = first(query.featured) === 'true';

  const sort: SortKey = SORTS.some((option) => option.value === sortParam)
    ? (sortParam as SortKey)
    : 'popular';
  const sortOption = SORTS.find((option) => option.value === sort) ?? SORTS[0];

  // On a brand page the brand is fixed by the route; a `?brand=` query string
  // is ignored so the page cannot show another maker's products.
  const brandIds = useMemo(
    () =>
      brand
        ? [brand.id]
        : brandParam
            .split(',')
            .map((entry) => Number(entry.trim()))
            .filter((entry) => Number.isInteger(entry) && entry > 0),
    [brand, brandParam]
  );
  const brandIdsKey = brandIds.join(',');

  // Old category links used `?category=<id>`. Resolve them into a real
  // collection so filters, the heading and the sidebar all agree.
  const legacyCategory = useMemo(() => {
    if (category) return undefined;
    const raw = first(query.category);
    if (!raw) return undefined;
    return categories.find((entry) => String(entry.id) === raw || entry.slug === raw);
  }, [category, categories, query.category]);

  const effectiveCategory = category ?? legacyCategory;

  const treeCategory = useMemo(
    () => (effectiveCategory ? findNode(tree, effectiveCategory.id) ?? effectiveCategory : undefined),
    [effectiveCategory, tree]
  );

  const categoryIds = useMemo(
    () => (treeCategory ? collectSubtreeIds(treeCategory) : undefined),
    [treeCategory]
  );
  const categoryIdsKey = categoryIds?.join(',') ?? '';

  const basePath = brand
    ? `/brands/${brand.slug}`
    : effectiveCategory
      ? `/products/${effectiveCategory.slug}`
      : '/products';

  const update = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams();
      const current: Record<string, string | undefined> = {
        search: searchTerm || undefined,
        // Path-implied brands are never written to the query string.
        brand: brand ? undefined : brandIdsKey || undefined,
        min_price: minPriceParam || undefined,
        max_price: maxPriceParam || undefined,
        rating: ratingParam || undefined,
        on_sale: onSale ? 'true' : undefined,
        in_stock: inStock ? 'true' : undefined,
        featured: featured ? 'true' : undefined,
        sort: sort === 'popular' ? undefined : sort,
        view: view === 'grid' ? undefined : view,
      };

      const merged = { ...current, ...patch };
      // Even an explicit patch cannot detach a brand page from its brand.
      if (brand) delete merged.brand;

      for (const [key, value] of Object.entries(merged)) {
        if (value !== undefined && value !== '') next.set(key, value);
      }

      const qs = next.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    },
    [
      basePath,
      brand,
      brandIdsKey,
      featured,
      inStock,
      maxPriceParam,
      minPriceParam,
      onSale,
      ratingParam,
      router,
      searchTerm,
      sort,
      view,
    ]
  );

  /* ------------------------------------------------------------ catalogue */
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .list<Product>('/products/browse', {
        page,
        pageSize: PAGE_SIZE,
        search: searchTerm || undefined,
        sortBy: sortOption.sortBy,
        sortDir: sortOption.sortDir,
        category_ids: categoryIdsKey || undefined,
        brand_ids: brandIdsKey || undefined,
        min_price: minPriceParam || undefined,
        max_price: maxPriceParam || undefined,
        min_rating: ratingParam || undefined,
        on_sale: onSale || undefined,
        in_stock: inStock || undefined,
        featured: featured || undefined,
      })
      .then((result) => {
        if (cancelled) return;
        setProducts(result.data);
        setTotal(result.meta.total);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : 'Could not load this collection');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    brandIdsKey,
    categoryIdsKey,
    featured,
    inStock,
    maxPriceParam,
    minPriceParam,
    onSale,
    page,
    ratingParam,
    reloadKey,
    searchTerm,
    sortOption.sortBy,
    sortOption.sortDir,
  ]);

  /* --------------------------------------------------------------- brands */
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    // On a brand page the picker is hidden, so the directory is not needed.
    if (brand) return;
    let cancelled = false;
    api
      .get<Brand[]>('/brands/all')
      .then((result) => {
        if (!cancelled) setBrands(result.filter((entry) => entry.status === 'active'));
      })
      .catch(() => {
        // The grid still works without the optional brand filter.
      });
    return () => {
      cancelled = true;
    };
  }, [brand]);

  /* -------------------------------------------------------- price facets */
  const [bounds, setBounds] = useState<{ min: number; max: number } | null>(null);
  const [localRange, setLocalRange] = useState<{ min: number; max: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBounds(null);
    api
      .get<{ min_price: number | string; max_price: number | string }>('/products/browse/facets', {
        category_ids: categoryIdsKey || undefined,
        brand_ids: brandIdsKey || undefined,
      })
      .then((result) => {
        if (cancelled) return;
        const min = num(result.min_price);
        const max = num(result.max_price);
        if (max <= 0) {
          setBounds({ min: 0, max: 100000 });
          return;
        }
        const floor = Math.max(0, Math.floor(min / 1000) * 1000);
        const ceiling = Math.max(floor + 1000, Math.ceil(max / 1000) * 1000);
        setBounds({ min: floor, max: ceiling });
      })
      .catch(() => {
        if (!cancelled) setBounds({ min: 0, max: 100000 });
      });
    return () => {
      cancelled = true;
    };
  }, [brandIdsKey, categoryIdsKey]);

  useEffect(() => {
    if (!bounds) return;
    const from = minPriceParam ? clamp(Number(minPriceParam), bounds.min, bounds.max) : bounds.min;
    const to = maxPriceParam ? clamp(Number(maxPriceParam), bounds.min, bounds.max) : bounds.max;
    setLocalRange({ min: Math.min(from, to), max: Math.max(from, to) });
  }, [bounds, maxPriceParam, minPriceParam]);

  const commitPrice = useCallback(
    (range: { min: number; max: number } | null = localRange) => {
      if (!bounds || !range) return;
      update({
        min_price: range.min <= bounds.min ? undefined : String(Math.round(range.min)),
        max_price: range.max >= bounds.max ? undefined : String(Math.round(range.max)),
      });
    },
    [bounds, localRange, update]
  );

  /* --------------------------------------------------------------- search */
  const [searchDraft, setSearchDraft] = useState(searchTerm);

  useEffect(() => {
    setSearchDraft(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const term = searchDraft.trim();
    if (term === searchTerm) return;
    const timer = window.setTimeout(() => {
      update({ search: term || undefined });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [searchDraft, searchTerm, update]);

  /* --------------------------------------------------------------- drawer */
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!filtersOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [filtersOpen]);

  /* ---------------------------------------------------------------- chips */
  const activeFilterCount =
    (brand ? 0 : brandIds.length) +
    (minPriceParam || maxPriceParam ? 1 : 0) +
    (ratingParam ? 1 : 0) +
    (onSale ? 1 : 0) +
    (inStock ? 1 : 0) +
    (featured ? 1 : 0);

  const toggleBrand = (id: number) => {
    const next = brandIds.includes(id)
      ? brandIds.filter((entry) => entry !== id)
      : [...brandIds, id];
    update({ brand: next.length ? next.join(',') : undefined });
  };

  const clearAll = () => {
    setSearchDraft('');
    setLocalRange(bounds ? { min: bounds.min, max: bounds.max } : null);
    update({
      search: undefined,
      brand: undefined,
      min_price: undefined,
      max_price: undefined,
      rating: undefined,
      on_sale: undefined,
      in_stock: undefined,
      featured: undefined,
    });
  };

  const chips: Array<{ key: string; label: string; remove: () => void }> = [];
  if (!brand) {
    for (const id of brandIds) {
      chips.push({
        key: `brand-${id}`,
        label: brands.find((entry) => entry.id === id)?.name ?? `Brand ${id}`,
        remove: () => toggleBrand(id),
      });
    }
  }
  if (minPriceParam || maxPriceParam) {
    const minLabel = minPriceParam
      ? formatMoney(Number(minPriceParam), 'PHP', { decimals: 0 })
      : null;
    const maxLabel = maxPriceParam
      ? formatMoney(Number(maxPriceParam), 'PHP', { decimals: 0 })
      : null;
    chips.push({
      key: 'price',
      label: minLabel
        ? `${minLabel} – ${maxLabel ?? 'Any price'}`
        : `Up to ${maxLabel}`,
      remove: () => {
        setLocalRange(bounds ? { min: bounds.min, max: bounds.max } : null);
        update({ min_price: undefined, max_price: undefined });
      },
    });
  }
  if (ratingParam) {
    chips.push({
      key: 'rating',
      label: `${ratingParam}★ & up`,
      remove: () => update({ rating: undefined }),
    });
  }
  if (onSale) {
    chips.push({ key: 'on_sale', label: 'On sale', remove: () => update({ on_sale: undefined }) });
  }
  if (inStock) {
    chips.push({ key: 'in_stock', label: 'In stock', remove: () => update({ in_stock: undefined }) });
  }
  if (featured) {
    chips.push({
      key: 'featured',
      label: 'Editor’s picks',
      remove: () => update({ featured: undefined }),
    });
  }

  /* --------------------------------------------------------------- filters */
  const filterPanel = (
    <div>
      <FilterSection title="Collections">
        <ul className="space-y-1">
          <li>
            <CategoryLink
              href="/products"
              label="All collections"
              count={categories.reduce((sum, entry) => sum + (entry.product_count ?? 0), 0)}
              active={!effectiveCategory && !brand}
            />
          </li>
          {tree.map((node) => (
            <CategoryBranch
              key={node.id}
              node={node}
              depth={0}
              activeId={effectiveCategory?.id}
            />
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Price">
        {bounds && localRange ? (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3 text-xs font-semibold text-sand-800 dark:text-sand-100">
              <span className="rounded-lg bg-[var(--surface-sunken)] px-2.5 py-1 tabular-nums">
                {formatMoney(localRange.min, 'PHP', { decimals: 0 })}
              </span>
              <span className="text-sand-400">to</span>
              <span className="rounded-lg bg-[var(--surface-sunken)] px-2.5 py-1 tabular-nums">
                {formatMoney(localRange.max, 'PHP', { decimals: 0 })}
              </span>
            </div>

            <div className="relative h-7">
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--border-subtle)]">
                <span
                  className="absolute inset-y-0 rounded-full bg-clay-600"
                  style={{
                    left: `${rangePercent(localRange.min, bounds)}%`,
                    right: `${100 - rangePercent(localRange.max, bounds)}%`,
                  }}
                />
              </div>
              <input
                type="range"
                aria-label="Minimum price"
                min={bounds.min}
                max={bounds.max}
                step={priceStep(bounds)}
                value={localRange.min}
                onChange={(event) =>
                  setLocalRange({
                    min: Math.min(Number(event.target.value), localRange.max - priceStep(bounds)),
                    max: localRange.max,
                  })
                }
                onPointerUp={() => commitPrice()}
                onKeyUp={() => commitPrice()}
                className="price-range"
              />
              <input
                type="range"
                aria-label="Maximum price"
                min={bounds.min}
                max={bounds.max}
                step={priceStep(bounds)}
                value={localRange.max}
                onChange={(event) =>
                  setLocalRange({
                    min: localRange.min,
                    max: Math.max(Number(event.target.value), localRange.min + priceStep(bounds)),
                  })
                }
                onPointerUp={() => commitPrice()}
                onKeyUp={() => commitPrice()}
                className="price-range"
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[0.65rem] text-muted">
                {formatMoney(bounds.min, 'PHP', { decimals: 0 })} —{' '}
                {formatMoney(bounds.max, 'PHP', { decimals: 0 })}
              </span>
              <button
                type="button"
                onClick={() => commitPrice()}
                className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-clay-700 transition-colors hover:text-clay-800 dark:text-clay-400"
              >
                Apply
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="skeleton h-7 w-full rounded-lg" />
            <div className="skeleton h-4 w-3/4 rounded" />
          </div>
        )}
      </FilterSection>

      {/* The brand is fixed by the path on `/brands/[slug]`, so the picker
          would only be able to navigate away from the current page. */}
      {brand ? null : (
        <FilterSection title="Brand" count={brandIds.length}>
          {brands.length ? (
            <div className="space-y-0.5">
              {brands.map((entry) => (
                <CheckRow
                  key={entry.id}
                  label={entry.name}
                  checked={brandIds.includes(entry.id)}
                  onChange={() => toggleBrand(entry.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted">Brands are loading…</p>
          )}
        </FilterSection>
      )}

      <FilterSection title="Sort by">
        <div className="space-y-0.5">
          {SORTS.map((option) => (
            <CheckRow
              key={option.value}
              label={option.label}
              checked={sort === option.value}
              type="radio"
              onChange={() =>
                update({ sort: option.value === 'popular' ? undefined : option.value })
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        <div className="space-y-0.5">
          {[4, 3, 2, 1].map((rating) => (
            <CheckRow
              key={rating}
              checked={ratingParam === String(rating)}
              onChange={() =>
                update({ rating: ratingParam === String(rating) ? undefined : String(rating) })
              }
              label={
                <span className="flex items-center gap-2">
                  <StarRating value={rating} size="sm" />
                  <span className="text-xs text-muted">&amp; up</span>
                </span>
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Offers">
        <div className="space-y-0.5">
          <CheckRow
            label="On sale"
            checked={onSale}
            onChange={() => update({ on_sale: onSale ? undefined : 'true' })}
          />
          <CheckRow
            label="In stock only"
            checked={inStock}
            onChange={() => update({ in_stock: inStock ? undefined : 'true' })}
          />
          <CheckRow
            label="Editor’s picks"
            checked={featured}
            onChange={() => update({ featured: featured ? undefined : 'true' })}
          />
        </div>
      </FilterSection>

      {activeFilterCount > 0 ? (
        <div className="pt-4">
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[var(--border-subtle)] py-2.5 text-xs font-semibold text-sand-700 transition-colors hover:border-clay-300 hover:bg-clay-50 hover:text-clay-800 dark:text-sand-300 dark:hover:bg-walnut-800"
          >
            <X className="size-3.5" />
            Clear {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'}
          </button>
        </div>
      ) : null}
    </div>
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginationMeta: PaginationMeta = {
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages,
    from: total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1,
    to: Math.min(page * PAGE_SIZE, total),
  };

  const art = brand
    ? brand.logo
      ? imageUrl(brand.logo)
      : '/images/hero-living.jpg'
    : effectiveCategory?.image
      ? imageUrl(effectiveCategory.image)
      : CATEGORY_ART[effectiveCategory?.slug ?? ''] ?? '/images/hero-living.jpg';

  return (
    <div className="flex flex-col gap-6">
      {/* ---------------------------------------------------------- header */}
      <header className="relative overflow-hidden rounded-[1.4rem] border border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
        <div
          className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-clay-200/45 blur-3xl dark:bg-clay-900/25"
          aria-hidden
        />
        <div className="relative grid gap-7 px-5 py-7 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
          <div>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[0.68rem] text-muted">
              <Link href="/" className="transition-colors hover:text-clay-700 dark:hover:text-clay-400">
                Home
              </Link>
              <ChevronRight className="size-3 text-sand-400" aria-hidden />
              {brand ? (
                <>
                  <Link
                    href="/brands"
                    className="transition-colors hover:text-clay-700 dark:hover:text-clay-400"
                  >
                    Brands
                  </Link>
                  <ChevronRight className="size-3 text-sand-400" aria-hidden />
                  <span className="text-sand-700 dark:text-sand-300">{brand.name}</span>
                </>
              ) : (
                <>
                  <Link
                    href="/products"
                    className="transition-colors hover:text-clay-700 dark:hover:text-clay-400"
                  >
                    Collections
                  </Link>
                  {effectiveCategory ? (
                    <>
                      <ChevronRight className="size-3 text-sand-400" aria-hidden />
                      <span className="text-sand-700 dark:text-sand-300">
                        {effectiveCategory.name}
                      </span>
                    </>
                  ) : null}
                </>
              )}
            </nav>

            <p className="mt-6 flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-clay-700 dark:text-clay-400">
              <Sparkles className="size-3.5" aria-hidden />
              {brand ? 'The maker' : effectiveCategory ? 'The collection' : 'The complete edit'}
            </p>
            <h1 className="mt-2.5 font-display text-3xl leading-[1.05] tracking-[-0.02em] text-walnut-950 dark:text-sand-50 sm:text-4xl lg:text-[2.9rem]">
              {brand ? brand.name : effectiveCategory ? effectiveCategory.name : 'All collections'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand-600 dark:text-sand-300">
              {brand
                ? brand.description ??
                  'Furniture from this maker — solid materials, quiet lines and details made to be lived with.'
                : effectiveCategory
                  ? effectiveCategory.description ??
                    'Considered pieces for this room — solid materials, quiet lines and details made to be lived with.'
                  : 'Every piece in the studio, in one place. Use the filters to find the material, maker and price that suit the room you have in mind.'}
            </p>
            <p className="mt-4 text-xs text-muted">
              {loading ? 'Gathering the collection…' : `${formatNumber(total)} piece${total === 1 ? '' : 's'} available`}
            </p>
          </div>

          <div
            className={cn(
              'hidden overflow-hidden rounded-[1.1rem] border border-white/50 shadow-[var(--shadow-card)] lg:block dark:border-white/10',
              brand && 'bg-[var(--surface-raised)]'
            )}
          >
            <img
              src={art}
              alt=""
              aria-hidden
              className={cn(
                'aspect-[4/3] w-full',
                // Logos are usually transparent marks, so they are contained
                // rather than cropped; photography still fills the frame.
                brand ? 'object-contain p-6' : 'object-cover'
              )}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[16.5rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)]">
        {/* --------------------------------------------------------- sidebar */}
        <aside className="hidden lg:block">
          <div className="surface-card sticky top-24 overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
              <span className="flex items-center gap-2 text-sm font-semibold text-sand-900 dark:text-sand-50">
                <SlidersHorizontal className="size-4 text-clay-600 dark:text-clay-400" aria-hidden />
                Filters
              </span>
              {activeFilterCount > 0 ? (
                <span className="rounded-full bg-clay-100 px-2 py-0.5 text-[0.65rem] font-semibold text-clay-700 dark:bg-clay-500/15 dark:text-clay-300">
                  {activeFilterCount}
                </span>
              ) : null}
            </div>
            <div className="max-h-[calc(100dvh-9rem)] overflow-y-auto px-5">{filterPanel}</div>
          </div>
        </aside>

        {/* ---------------------------------------------------------- results */}
        <div className="min-w-0">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-sand-600 dark:text-sand-300">
                <span className="font-semibold text-sand-900 dark:text-sand-50">
                  {formatNumber(total)}
                </span>{' '}
                {total === 1 ? 'piece' : 'pieces'}
                {searchTerm ? (
                  <>
                    {' '}
                    for <span className="font-medium text-sand-800 dark:text-sand-100">“{searchTerm}”</span>
                  </>
                ) : null}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search — its own row on phones, inline from `sm` up. */}
                <div className="relative w-full min-w-0 sm:w-auto">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-sand-400"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder={brand ? `Search ${brand.name}` : 'Search this collection'}
                    aria-label={brand ? `Search ${brand.name}` : 'Search this collection'}
                    className="h-9 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] pl-9 pr-8 text-xs text-sand-800 outline-none transition-colors placeholder:text-sand-400 focus:border-clay-500 focus:ring-2 focus:ring-clay-500/20 sm:w-52 dark:text-sand-100"
                  />
                  {searchDraft ? (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setSearchDraft('')}
                      className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-sand-400 transition-colors hover:bg-[var(--surface-sunken)] hover:text-sand-700"
                    >
                      <X className="size-3" />
                    </button>
                  ) : null}
                </div>

                {/* Sort */}
                <div className="relative shrink-0">
                  <select
                    aria-label="Sort products"
                    value={sort}
                    onChange={(event) =>
                      update({
                        sort: event.target.value === 'popular' ? undefined : event.target.value,
                      })
                    }
                    className="h-9 cursor-pointer appearance-none rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] pl-3 pr-8 text-xs font-medium text-sand-700 outline-none transition-colors focus:border-clay-500 focus:ring-2 focus:ring-clay-500/20 dark:text-sand-200"
                  >
                    {SORTS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-sand-400"
                    aria-hidden
                  />
                </div>

                {/* Grid / list */}
                <div className="flex shrink-0 items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-0.5">
                  <button
                    type="button"
                    aria-label="Grid view"
                    aria-pressed={view === 'grid'}
                    onClick={() => update({ view: undefined })}
                    className={cn(
                      'flex size-8 items-center justify-center rounded-md transition-colors',
                      view === 'grid'
                        ? 'bg-clay-600 text-white'
                        : 'text-sand-500 hover:bg-[var(--surface-sunken)]'
                    )}
                  >
                    <Grid2X2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="List view"
                    aria-pressed={view === 'list'}
                    onClick={() => update({ view: 'list' })}
                    className={cn(
                      'flex size-8 items-center justify-center rounded-md transition-colors',
                      view === 'list'
                        ? 'bg-clay-600 text-white'
                        : 'text-sand-500 hover:bg-[var(--surface-sunken)]'
                    )}
                  >
                    <LayoutList className="size-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 text-xs font-semibold text-sand-700 transition-colors hover:border-clay-300 hover:bg-clay-50 lg:hidden dark:text-sand-200 dark:hover:bg-walnut-800"
                >
                  <SlidersHorizontal className="size-3.5" />
                  Filters
                  {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                </button>
              </div>
            </div>

            {chips.length ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.remove}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-2.5 py-1 text-[0.68rem] font-medium text-sand-700 transition-colors hover:border-clay-300 hover:text-clay-700 dark:text-sand-200"
                  >
                    {chip.label}
                    <X className="size-3 text-sand-400" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[0.68rem] font-semibold text-clay-700 underline decoration-clay-300 underline-offset-4 transition-colors hover:text-clay-800 dark:text-clay-400"
                >
                  Clear all
                </button>
              </div>
            ) : null}
          </div>

          <div id="collection-results" className="scroll-mt-28 pt-5">
            {loading ? (
              <CollectionSkeleton view={view} />
            ) : error ? (
              <CollectionError message={error} onRetry={() => setReloadKey((key) => key + 1)} />
            ) : products.length === 0 ? (
              <CollectionEmpty onClear={clearAll} />
            ) : (
              <>
                <div
                  className={cn(
                    view === 'grid'
                      ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'
                      : 'flex flex-col gap-4'
                  )}
                >
                  {products.map((product, index) => (
                    <PremiumProductCard
                      key={product.id}
                      product={product}
                      layout={view}
                      variant="card"
                      priority={index < 4}
                    />
                  ))}
                </div>

                {totalPages > 1 ? (
                  <div className="mt-9 border-t border-[var(--border-subtle)] pt-5">
                    <Pagination
                      meta={paginationMeta}
                      onPage={(next) => {
                        update({ page: String(next) });
                        document
                          .getElementById('collection-results')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      itemLabel="pieces"
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------- mobile filters */}
      {filtersOpen ? (
        <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div
            className="absolute inset-0 animate-[fade-in_0.2s_ease-out_both] bg-walnut-950/45 backdrop-blur-[2px]"
            onClick={() => setFiltersOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(21rem,90vw)] animate-[drawer-in_0.35s_cubic-bezier(0.22,1,0.36,1)_both] flex-col bg-[var(--surface-raised)] shadow-[0_30px_80px_-20px_rgba(22,19,15,0.5)]">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
              <span className="flex items-center gap-2 text-sm font-semibold text-sand-900 dark:text-sand-50">
                <SlidersHorizontal className="size-4 text-clay-600 dark:text-clay-400" />
                Filters
              </span>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
                className="flex size-8 items-center justify-center rounded-full text-sand-500 transition-colors hover:bg-[var(--surface-sunken)]"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">{filterPanel}</div>
            <div className="border-t border-[var(--border-subtle)] p-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="w-full rounded-full bg-walnut-950 py-3 text-sm font-semibold text-white transition-colors hover:bg-clay-700 dark:bg-clay-600 dark:hover:bg-clay-700"
              >
                Show {formatNumber(total)} piece{total === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------- subcomponents */

function FilterSection({
  title,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-[var(--border-subtle)] last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-sand-700 dark:text-sand-300">
          {title}
          {count ? (
            <span className="rounded-full bg-clay-100 px-1.5 py-0.5 text-[0.6rem] tracking-normal text-clay-700 dark:bg-clay-500/15 dark:text-clay-300">
              {count}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 text-sand-400 transition-transform duration-300',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-300 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
  type = 'checkbox',
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: () => void;
  type?: 'checkbox' | 'radio';
}) {
  return (
    <label className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg px-1 py-1.5 text-sm transition-colors hover:bg-[var(--surface-sunken)]">
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            'flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-all duration-200',
            checked
              ? 'border-clay-600 bg-clay-600 text-white'
              : 'border-sand-300 bg-transparent group-hover:border-clay-400 dark:border-walnut-700'
          )}
        >
          {checked ? <Check className="size-3" strokeWidth={3} /> : null}
        </span>
        <span className="min-w-0 text-sand-700 dark:text-sand-200">{label}</span>
      </span>
      <input
        type={type}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}

function CategoryLink({
  href,
  label,
  count,
  active,
  depth = 0,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
  depth?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center justify-between gap-2 rounded-lg py-1.5 pr-1 text-sm transition-colors',
        depth === 0 ? 'pl-1' : 'pl-4',
        active
          ? 'font-semibold text-clay-700 dark:text-clay-400'
          : 'text-sand-700 hover:text-clay-700 dark:text-sand-300 dark:hover:text-clay-400'
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            'size-1.5 shrink-0 rounded-full transition-colors',
            active ? 'bg-clay-600' : 'bg-sand-300 group-hover:bg-clay-400 dark:bg-walnut-700'
          )}
          aria-hidden
        />
        <span className="truncate">{label}</span>
      </span>
      {typeof count === 'number' && count > 0 ? (
        <span className="shrink-0 text-[0.65rem] tabular-nums text-sand-400">{count}</span>
      ) : null}
    </Link>
  );
}

function CategoryBranch({
  node,
  depth,
  activeId,
}: {
  node: Category;
  depth: number;
  activeId?: number;
}) {
  return (
    <li>
      <CategoryLink
        href={`/products/${node.slug}`}
        label={node.name}
        count={subtreeCount(node)}
        active={node.id === activeId}
        depth={depth}
      />
      {node.children?.length ? (
        <ul>
          {node.children.map((child) => (
            <CategoryBranch key={child.id} node={child} depth={depth + 1} activeId={activeId} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function CollectionSkeleton({ view }: { view: 'grid' | 'list' }) {
  return (
    <div
      className={cn(
        view === 'grid'
          ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'
          : 'flex flex-col gap-4'
      )}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className={cn(
            'rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-3 shadow-[var(--shadow-card)]',
            view === 'list' && 'flex flex-col gap-4 sm:flex-row'
          )}
        >
          <div
            className={cn(
              'skeleton rounded-[1.05rem]',
              view === 'list'
                ? 'aspect-[4/3] w-full sm:aspect-[4/5] sm:w-60'
                : 'aspect-[4/5] w-full'
            )}
          />
          <div className={cn('flex flex-1 flex-col', view === 'grid' ? 'pt-4' : 'pt-1')}>
            <div className="skeleton h-2.5 w-20" />
            <div className="mt-2 skeleton h-4 w-4/5" />
            <div className="mt-2 skeleton h-4 w-3/5" />
            <div className="mt-auto pt-5 skeleton h-3.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CollectionEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-6 py-16 text-center shadow-[var(--shadow-card)]">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--surface-sunken)] text-clay-600 dark:text-clay-400">
        <Sparkles className="size-5" />
      </span>
      <h2 className="mt-4 font-display text-xl text-walnut-950 dark:text-sand-50">
        Nothing matches that combination
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Try widening the price range, clearing a filter, or starting again to see the whole
        collection.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 rounded-full border border-[var(--border-subtle)] px-5 py-2 text-xs font-semibold text-sand-700 transition-colors hover:border-clay-300 hover:bg-clay-50 dark:text-sand-200 dark:hover:bg-walnut-800"
      >
        Clear all filters
      </button>
    </div>
  );
}

function CollectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50/60 px-6 py-14 text-center dark:border-rose-500/25 dark:bg-rose-500/5">
      <h2 className="font-display text-xl text-walnut-950 dark:text-sand-50">
        This collection could not load
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full bg-walnut-950 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-clay-700 dark:bg-clay-600"
      >
        Try again
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ helpers */

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function priceStep(bounds: { min: number; max: number }): number {
  const span = bounds.max - bounds.min;
  if (span >= 100000) return 1000;
  if (span >= 20000) return 500;
  return 100;
}

function rangePercent(value: number, bounds: { min: number; max: number }): number {
  const span = bounds.max - bounds.min;
  if (span <= 0) return 0;
  return ((value - bounds.min) / span) * 100;
}

function subtreeCount(node: Category): number {
  return (node.product_count ?? 0) + (node.children ?? []).reduce((sum, child) => sum + subtreeCount(child), 0);
}

function collectSubtreeIds(node: Category): number[] {
  return [node.id, ...(node.children ?? []).flatMap((child) => collectSubtreeIds(child))];
}

function findNode(nodes: Category[], id: number): Category | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const match = node.children ? findNode(node.children, id) : undefined;
    if (match) return match;
  }
  return undefined;
}
