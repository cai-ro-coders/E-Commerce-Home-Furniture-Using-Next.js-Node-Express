import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Skeleton } from './Feedback';

export type StatTone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONES: Record<StatTone, string> = {
  brand: 'bg-clay-100 text-clay-700 dark:bg-clay-500/15 dark:text-clay-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  neutral: 'bg-sand-100 text-sand-700 dark:bg-walnut-800 dark:text-sand-300',
};

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: StatTone;
  /** Percentage change against the previous period; sign drives the colour. */
  trend?: number | null;
  trendLabel?: string;
  hint?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

/**
 * Dashboard/summary tile.
 *
 * `trend` is a signed percentage: positive is green, negative red, exactly zero
 * neutral, and `null`/`undefined` hides the row entirely.
 */
export function StatCard({
  label,
  value,
  icon,
  tone = 'brand',
  trend,
  trendLabel = 'vs last period',
  hint,
  loading = false,
  className,
}: StatCardProps) {
  const hasTrend = typeof trend === 'number' && Number.isFinite(trend);
  const TrendIcon = !hasTrend ? Minus : trend! > 0 ? ArrowUpRight : trend! < 0 ? ArrowDownRight : Minus;
  const trendClass = !hasTrend
    ? 'text-muted'
    : trend! > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : trend! < 0
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-muted';

  return (
    <div
      className={cn(
        'surface-card group relative flex flex-col gap-3 overflow-hidden p-5 transition-shadow hover:shadow-[var(--shadow-lift)]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">{label}</p>
        {icon ? (
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105',
              TONES[tone]
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>

      {loading ? (
        <Skeleton className="h-7 w-28" />
      ) : (
        <p className="font-display text-2xl font-semibold leading-none tracking-tight text-sand-900 dark:text-sand-50">
          {value}
        </p>
      )}

      {hasTrend ? (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className={cn('inline-flex items-center gap-0.5 font-semibold', trendClass)}>
            <TrendIcon className="size-3.5" aria-hidden />
            {Math.abs(trend!).toFixed(1)}%
          </span>
          <span className="text-muted">{trendLabel}</span>
        </div>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}

      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 size-20 rounded-full opacity-[0.07] transition-transform group-hover:scale-125',
          TONES[tone].split(' ')[0]
        )}
      />
    </div>
  );
}
