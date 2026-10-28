'use client';

/**
 * Compact metric strip used as the header of a module's list page.
 *
 * Deliberately a single card with hairline dividers rather than a grid of tiles:
 * it reads as part of the page header instead of competing with the table below
 * for attention. Scrolls horizontally on narrow screens rather than wrapping, so
 * the dividers always stay straight.
 */
import { Skeleton } from '@/components/ui/Feedback';
import { cn } from '@/lib/cn';

export interface StatsStripItem {
  /**
   * Shown to the user and used as the React key. Callers reserve the strip's
   * width with placeholder rows that all share one placeholder label, so the
   * index is folded into the key to keep it unique — see the `key` below.
   */
  label: string;
  value: React.ReactNode;
  /** Colours the value; defaults to the primary text colour. */
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'brand';
  /** Rendered under the value, e.g. "of 60 total". */
  hint?: React.ReactNode;
}

const TONES = {
  default: 'text-sand-900 dark:text-sand-50',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-rose-600 dark:text-rose-400',
  brand: 'text-clay-600 dark:text-clay-400',
} as const;

export function StatsStrip({
  items,
  loading = false,
  className,
}: {
  items: StatsStripItem[];
  loading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'surface-card flex divide-x divide-[var(--border-subtle)] overflow-x-auto',
        className
      )}
    >
      {items.map((item, index) => (
        // Labels are not unique: the loading placeholders all read "—". Index is
        // safe to include because a strip is a fixed, ordered run of metrics —
        // cells never reorder, and swapping placeholders for real data remounts
        // them anyway since the label changes.
        <div
          key={`${item.label}-${index}`}
          className="flex min-w-36 shrink-0 flex-col gap-1 px-4 py-3.5"
        >
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
            {item.label}
          </span>
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <span
              className={cn(
                'font-display text-xl font-semibold leading-none tabular-nums',
                TONES[item.tone ?? 'default']
              )}
            >
              {item.value}
            </span>
          )}
          {!loading && item.hint ? (
            <span className="text-[0.7rem] text-muted">{item.hint}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
