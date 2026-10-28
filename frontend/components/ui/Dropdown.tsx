'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside } from '@/hooks/useClickOutside';

export interface DropdownItem {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  /** Draw a divider above this item. */
  divider?: boolean;
}

/**
 * Row-action menu.
 *
 * Handles its own open state and closes on outside click or Escape so table
 * rows do not each need to.
 */
export function Dropdown({
  items,
  trigger,
  align = 'right',
  label = 'Actions',
  className,
}: {
  items: DropdownItem[];
  trigger?: React.ReactNode;
  align?: 'left' | 'right';
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside<HTMLDivElement>(close, open);

  if (items.length === 0) return null;

  return (
    <div ref={ref} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex size-8 items-center justify-center rounded-lg text-sand-500 transition-colors',
          'hover:bg-sand-100 hover:text-sand-800 dark:hover:bg-walnut-800 dark:hover:text-sand-200',
          open && 'bg-sand-100 text-sand-800 dark:bg-walnut-800 dark:text-sand-200'
        )}
      >
        {trigger ?? <MoreVertical className="size-4" />}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            'absolute z-30 mt-1 min-w-48 origin-top animate-[rise_0.16s_ease-out] overflow-hidden rounded-xl',
            'border border-[var(--border-subtle)] bg-[var(--surface-raised)] py-1 shadow-[var(--shadow-lift)]',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, index) => {
            const itemClass = cn(
              'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
              item.danger
                ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
                : 'text-sand-700 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-walnut-800',
              item.disabled && 'pointer-events-none opacity-45',
              item.divider && index > 0 && 'mt-1 border-t border-[var(--border-subtle)] pt-2'
            );

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  className={itemClass}
                  onClick={close}
                >
                  {item.icon ? <span className="size-4 shrink-0">{item.icon}</span> : null}
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={itemClass}
                onClick={() => {
                  close();
                  item.onClick?.();
                }}
              >
                {item.icon ? <span className="size-4 shrink-0">{item.icon}</span> : null}
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/** Segmented icon buttons shown directly in a table row. */
export function RowActions({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-end gap-0.5', className)}>{children}</div>
  );
}

export function IconAction({
  label,
  onClick,
  href,
  icon,
  tone = 'neutral',
  disabled,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  icon: React.ReactNode;
  tone?: 'neutral' | 'danger' | 'brand';
  disabled?: boolean;
}) {
  const tones = {
    neutral:
      'text-sand-500 hover:bg-sand-100 hover:text-sand-800 dark:hover:bg-walnut-800 dark:hover:text-sand-200',
    brand: 'text-clay-600 hover:bg-clay-50 dark:hover:bg-clay-500/10',
    danger: 'text-sand-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400',
  } as const;

  const className = cn(
    'inline-flex size-8 items-center justify-center rounded-lg transition-colors',
    tones[tone],
    disabled && 'pointer-events-none opacity-40'
  );

  if (href) {
    return (
      <a href={href} title={label} aria-label={label} className={className}>
        {icon}
      </a>
    );
  }

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {icon}
    </button>
  );
}
