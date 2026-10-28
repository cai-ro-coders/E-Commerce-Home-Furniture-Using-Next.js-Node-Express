'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StoreShell } from '@/components/storefront/StoreShell';
import { StoreFooter } from '@/components/storefront/StoreFooter';
import { imageUrl } from '@/lib/api';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ data: Category[] }>('/categories/tree')
      .then((res) => setCategories(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const topLevel = categories.filter((c) => c.parent_id === null);

  return (
    <StoreShell>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-walnut-900 dark:text-sand-100">
            Shop by Category
          </h1>
          <p className="mt-3 text-lg text-walnut-600 dark:text-sand-400">
            Explore our curated collections of premium home furniture
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-2xl" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topLevel.map((category) => (
              <Link
                key={category.id}
                href={`/products/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-sand-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-walnut-800"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {category.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl(category.image)}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-clay-200 to-sand-300 dark:from-walnut-700 dark:to-walnut-800">
                      <span className="text-4xl font-serif text-walnut-600 dark:text-sand-400">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl font-semibold text-walnut-900 dark:text-sand-100">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-walnut-600 dark:text-sand-400">
                      {category.description}
                    </p>
                  )}
                  <p className="mt-3 text-sm font-medium text-clay-600 dark:text-clay-400">
                    {category.product_count} product{category.product_count !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && topLevel.length === 0 && (
          <div className="text-center text-walnut-500 dark:text-sand-500">
            No categories available.
          </div>
        )}
      </main>
      <StoreFooter categories={topLevel} />
    </StoreShell>
  );
}
