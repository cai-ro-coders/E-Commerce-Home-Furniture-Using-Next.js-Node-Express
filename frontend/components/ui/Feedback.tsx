import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ----------------------------------------------------------------- spinner */

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-2', className)}>
      <Loader2 className="size-4 animate-spin text-clay-600" aria-hidden />
      {label ? <span className="text-sm text-muted">{label}</span> : null}
      <span className="sr-only">{label ?? 'Loading'}</span>
    </span>
  );
}

/** Full-panel spinner for route-level loading states. */
export function PageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="size-7 animate-spin text-clay-600" aria-hidden />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- skeleton */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden />;
}

/** Placeholder rows sized to match the real table. */
export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="flex flex-col gap-px overflow-hidden rounded-xl border border-[var(--border-subtle)]">
      <div className="flex gap-4 bg-[var(--surface-sunken)] px-4 py-3">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 border-t border-[var(--border-subtle)] px-4 py-3.5">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={cn('h-3.5 flex-1', columnIndex === 0 && 'max-w-[120px]', columnIndex === 1 && 'max-w-[200px]')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="surface-card overflow-hidden">
          <Skeleton className="aspect-4/3 rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="mt-1 h-5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="surface-card flex flex-col gap-3 p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- empty/error */

export function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
  icon,
  className,
}: {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-14 text-center', className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-[var(--surface-sunken)] text-sand-400">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-sand-800 dark:text-sand-200">{title}</p>
        {description ? <p className="max-w-sm text-xs text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-14 text-center', className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
        <AlertTriangle className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-sand-800 dark:text-sand-200">{title}</p>
        {description ? <p className="max-w-md text-xs text-muted">{description}</p> : null}
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg border border-sand-300 px-3 py-1.5 text-xs font-medium text-sand-700 transition-colors hover:bg-sand-100 dark:border-walnut-800 dark:text-sand-300 dark:hover:bg-walnut-800"
        >
          <RefreshCw className="size-3.5" />
          Try again
        </button>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------- progress */

export function ProgressBar({
  value,
  max = 100,
  className,
  tone = 'brand',
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
}) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const tones = {
    brand: 'bg-clay-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  } as const;

  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-sunken)]', className)}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', tones[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
