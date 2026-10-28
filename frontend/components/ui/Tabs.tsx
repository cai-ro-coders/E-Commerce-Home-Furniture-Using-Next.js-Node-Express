'use client';

import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

/** Underlined tab strip. Controlled: the parent owns the active id. */
export function Tabs({
  tabs,
  active,
  onChange,
  className,
  variant = 'underline',
}: {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'underline' | 'pills';
}) {
  if (variant === 'pills') {
    return (
      <div
        role="tablist"
        className={cn(
          'inline-flex flex-wrap items-center gap-1 rounded-xl bg-[var(--surface-sunken)] p-1',
          className
        )}
      >
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={selected}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
                selected
                  ? 'bg-[var(--surface-raised)] text-sand-900 shadow-sm dark:text-sand-50'
                  : 'text-muted hover:text-sand-800 dark:hover:text-sand-200',
                tab.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.badge}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 overflow-x-auto border-b border-[var(--border-subtle)]',
        className
      )}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={selected}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              '-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              selected
                ? 'border-clay-600 text-clay-700 dark:text-clay-300'
                : 'border-transparent text-muted hover:border-sand-300 hover:text-sand-800 dark:hover:text-sand-200',
              tab.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
}
