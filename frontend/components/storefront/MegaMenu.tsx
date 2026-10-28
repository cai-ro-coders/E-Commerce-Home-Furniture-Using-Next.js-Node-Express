'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { categoryIcon } from '@/components/storefront/categoryIcons';
import type { Category } from '@/types';

/**
 * The "All Categories" mega panel.
 *
 * Root categories become columns and their children become links. The card on
 * the right is intentionally editorial rather than another list: it gives the
 * panel a destination for people who are still browsing.
 */
export function MegaMenu({
  tree,
  onNavigate,
}: {
  tree: Category[];
  onNavigate: () => void;
}) {
  const roots = tree.filter((category) => !category.parent_id && category.status === 'active');

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-7 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_19rem]">
        <div className="grid grid-cols-2 gap-x-7 gap-y-7 md:grid-cols-3 xl:grid-cols-4">
          {roots.slice(0, 8).map((category) => {
            const Icon = categoryIcon(category.slug);
            return (
              <div key={category.id}>
                <Link
                  href={`/products/${category.slug}`}
                  onClick={onNavigate}
                  className="group flex items-center gap-2.5"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-sand-100 text-clay-700 transition-colors group-hover:bg-clay-600 group-hover:text-white">
                    <Icon className="size-4" />
                  </span>
                  <span className="font-display text-[0.95rem] font-medium text-walnut-950 transition-colors group-hover:text-clay-700">
                    {category.name}
                  </span>
                </Link>

                <ul className="mt-3 space-y-2">
                  {(category.children ?? []).slice(0, 4).map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/products/${child.slug}`}
                        onClick={onNavigate}
                        className="text-[0.78rem] text-sand-500 transition-colors hover:text-walnut-950"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                  {(category.children?.length ?? 0) > 4 ? (
                    <li>
                      <Link
                        href={`/products/${category.slug}`}
                        onClick={onNavigate}
                        className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-clay-700 hover:text-clay-800"
                      >
                        More
                        <ArrowRight className="size-3" />
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </div>

        <Link
          href="/products?featured=true"
          onClick={onNavigate}
          className="group relative hidden min-h-[19rem] overflow-hidden rounded-2xl bg-walnut-950 lg:block"
        >
          <img
            src="/images/category-living.jpg"
            alt=""
            className="absolute inset-0 size-full object-cover opacity-85 transition-transform duration-[900ms] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/90 via-walnut-950/20 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-5 text-white">
            <span className="inline-flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-clay-200">
              <Sparkles className="size-3" />
              The living edit
            </span>
            <p className="mt-2 font-display text-2xl leading-tight">
              Rooms that hold
              <br />
              the whole day.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em]">
              Explore the edit
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-sand-200 pt-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.7rem] font-medium text-sand-600">
          <Link href="/products" onClick={onNavigate} className="hover:text-clay-700">
            All furniture
          </Link>
          <Link href="/products?featured=true" onClick={onNavigate} className="hover:text-clay-700">
            Editor&apos;s picks
          </Link>
          <Link href="/products?on_sale=true" onClick={onNavigate} className="hover:text-clay-700">
            On sale
          </Link>
          <Link href="/products?sort=newest" onClick={onNavigate} className="hover:text-clay-700">
            New arrivals
          </Link>
        </div>
        <Link
          href="/categories"
          onClick={onNavigate}
          className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-walnut-950 hover:text-clay-700"
        >
          Browse the full index
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
