import { cn } from '@/lib/cn';

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('surface-card', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-4',
        className
      )}
    >
      {children ?? (
        <div className="flex flex-col gap-0.5">
          {title ? (
            <h3 className="text-sm font-semibold text-sand-900 dark:text-sand-100">{title}</h3>
          ) : null}
          {description ? <p className="text-xs text-muted">{description}</p> : null}
        </div>
      )}
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-5 py-4',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** A label/value pair used in detail panes. */
export function DetailItem({
  label,
  value,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm text-sand-900 dark:text-sand-100">{value ?? '—'}</dd>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        {breadcrumbs}
        <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-sand-900 dark:text-sand-50">
          {title}
        </h1>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
