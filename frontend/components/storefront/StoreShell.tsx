'use client';

/**
 * Storefront page chrome: header, footer and the centred content column.
 *
 * The header needs the category tree, which is public, so it is fetched here
 * once and shared with the page through context. `fullBleed` is used by the
 * editorial home page, whose hero and bands run edge-to-edge while the other
 * storefront pages keep the comfortable reading column.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { StoreFooter } from '@/components/storefront/StoreFooter';
import { StoreHeader } from '@/components/storefront/StoreHeader';
import { PageSpinner } from '@/components/ui/Feedback';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { scrollToHash } from '@/lib/scroll';
import type { Category } from '@/types';

interface StorefrontData {
  /** The nested tree, as returned by `/categories/tree`. */
  tree: Category[];
  /** Depth-first flattened list, for menus and the footer. */
  categories: Category[];
}

const StorefrontContext = createContext<StorefrontData | null>(null);

export function StoreShell({
  children,
  fullBleed = false,
}: {
  children: React.ReactNode;
  fullBleed?: boolean;
}) {
  const [tree, setTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await api.get<Category[]>('/categories/tree');
        if (!cancelled) setTree(cleanTree(result));
      } catch {
        if (!cancelled) setTree([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<StorefrontData>(
    () => ({ tree, categories: flatten(tree) }),
    [tree]
  );

  // If a visitor arrives from another page with an anchor, the target may not
  // exist until the shell has finished loading its chrome. Re-run the scroll
  // once that happens so deep links from /products and /cart land correctly.
  // The home page owns its own scroll because its lower sections continue to
  // grow while catalogue data loads.
  useEffect(() => {
    if (loading || pathname === '/') return;
    const timer = window.setTimeout(() => {
      scrollToHash();
    }, 100);
    return () => window.clearTimeout(timer);
  }, [loading, pathname]);

  if (loading) return <PageSpinner label="Loading the store…" />;

  return (
    <StorefrontContext.Provider value={value}>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-clay-600 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <StoreHeader categories={value.categories} tree={tree} />
        <main
          id="main"
          className={cn(
            'flex-1',
            fullBleed ? 'w-full' : 'mx-auto w-full max-w-7xl px-4 py-8 sm:px-6'
          )}
        >
          {children}
        </main>
        <StoreFooter categories={value.categories} />
      </div>
    </StorefrontContext.Provider>
  );
}

/** Access the category data the shell already loaded. */
export function useStorefrontData(): StorefrontData {
  const context = useContext(StorefrontContext);
  if (!context) throw new Error('useStorefrontData must be used inside <StoreShell>');
  return context;
}

/** Drop inactive branches and nested children from inactive parents. */
function cleanTree(nodes: Category[]): Category[] {
  return nodes
    .filter((node) => node.status === 'active')
    .map((node) => ({
      ...node,
      children: node.children ? cleanTree(node.children) : undefined,
    }));
}

/** Depth-first flatten, keeping the tree order for menus. */
function flatten(nodes: Category[]): Category[] {
  const out: Category[] = [];
  for (const node of nodes) {
    out.push({ ...node, children: undefined });
    if (node.children?.length) out.push(...flatten(node.children));
  }
  return out;
}
