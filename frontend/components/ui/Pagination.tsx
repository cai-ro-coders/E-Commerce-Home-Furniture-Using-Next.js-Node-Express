'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PaginationMeta } from '@/types';

function pageNumbers(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const out: Array<number | 'gap'> = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) out.push('gap');
    out.push(page);
    previous = page;
  }
  return out;
}

/** Page controls for lists rendered by the app (DataTables supplies its own). */
export function Pagination({
  meta,
  onPage,
  onPageSize,
  pageSizeOptions = [10, 20, 50, 100],
  className,
  itemLabel = 'items',
}: {
  meta: PaginationMeta | null | undefined;
  onPage: (page: number) => void;
  onPageSize?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
}) {
  if (!meta || meta.total === 0) return null;

  const pages = pageNumbers(meta.page, meta.totalPages);

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <span>
          Showing <span className="font-semibold text-sand-700 dark:text-sand-300">{meta.from}</span>
          {'–'}
          <span className="font-semibold text-sand-700 dark:text-sand-300">{meta.to}</span> of{' '}
          <span className="font-semibold text-sand-700 dark:text-sand-300">{meta.total}</span>{' '}
          {itemLabel}
        </span>

        {onPageSize ? (
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Rows per page</span>
            <select
              value={meta.pageSize}
              onChange={(event) => onPageSize(Number(event.target.value))}
              className="h-8 cursor-pointer rounded-lg border border-sand-300 bg-white px-2 text-xs text-sand-700 dark:border-walnut-800 dark:bg-walnut-900 dark:text-sand-300"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          aria-label="Previous page"
          disabled={meta.page <= 1}
          onClick={() => onPage(meta.page - 1)}
          className="inline-flex size-8 items-center justify-center rounded-lg border border-sand-300 text-sand-600 transition-colors hover:bg-sand-100 disabled:pointer-events-none disabled:opacity-40 dark:border-walnut-800 dark:text-sand-300 dark:hover:bg-walnut-800"
        >
          <ChevronLeft className="size-4" />
        </button>

        {pages.map((page, index) =>
          page === 'gap' ? (
            <span key={`gap-${index}`} className="px-1 text-xs text-muted">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              aria-current={page === meta.page ? 'page' : undefined}
              onClick={() => onPage(page)}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg border text-xs font-medium transition-colors',
                page === meta.page
                  ? 'border-clay-600 bg-clay-600 text-white'
                  : 'border-sand-300 text-sand-600 hover:bg-sand-100 dark:border-walnut-800 dark:text-sand-300 dark:hover:bg-walnut-800'
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPage(meta.page + 1)}
          className="inline-flex size-8 items-center justify-center rounded-lg border border-sand-300 text-sand-600 transition-colors hover:bg-sand-100 disabled:pointer-events-none disabled:opacity-40 dark:border-walnut-800 dark:text-sand-300 dark:hover:bg-walnut-800"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}
