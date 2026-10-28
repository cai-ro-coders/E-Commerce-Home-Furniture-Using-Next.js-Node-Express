'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SelectOption } from '@/components/ui/Field';

/**
 * Compact `<select>` sized to sit in a DataTable toolbar.
 *
 * The full `Select` in `components/ui` is a form control with a label, a hint
 * and room for error text; list filters need none of that, just a 36px-tall
 * control that lines up with the search box and the export button.
 */
export function ToolbarSelect({
  id,
  value,
  onChange,
  options,
  label,
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Accessible name; also rendered as the first, non-selectable option. */
  label: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-9 cursor-pointer appearance-none rounded-lg border border-sand-300 bg-white pl-3 pr-8',
          'text-sm font-medium text-sand-700 transition-colors hover:bg-sand-50',
          'focus:border-clay-500 focus:outline-none focus:ring-2 focus:ring-clay-500/25',
          'dark:border-walnut-800 dark:bg-walnut-900 dark:text-sand-200 dark:hover:bg-walnut-800'
        )}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-sand-400"
        aria-hidden
      />
    </div>
  );
}
