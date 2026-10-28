import { cn } from '@/lib/cn';

export function Badge({
  children,
  className,
  variant = 'neutral',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const variants = {
    neutral: 'bg-sand-100 text-sand-700 dark:bg-walnut-800 dark:text-sand-300',
    brand: 'bg-clay-100 text-clay-800 dark:bg-clay-500/15 dark:text-clay-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * A status pill driven by the tag helpers in `lib/format.ts`. The helper owns
 * the colour mapping so tables, cards and detail views always agree.
 */
export function StatusTag({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {label}
    </span>
  );
}
