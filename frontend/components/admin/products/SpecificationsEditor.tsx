'use client';

import { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { cn } from '@/lib/cn';

export interface SpecificationDraft {
  attribute_name: string;
  attribute_value: string;
}

const BLANK: SpecificationDraft = { attribute_name: '', attribute_value: '' };

/**
 * Attribute/value rows for a product.
 *
 * The API replaces the whole set on save, so this is a list, not a diff — which
 * is why an untouched row still has to round-trip. Rows with both fields empty
 * are dropped before submitting.
 */
export function SpecificationsEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: SpecificationDraft[];
  onChange: (next: SpecificationDraft[]) => void;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState<number | null>(null);

  const update = (index: number, patch: Partial<SpecificationDraft>) => {
    onChange(value.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const remove = (index: number) => {
    onChange(value.filter((_, rowIndex) => rowIndex !== index));
  };

  const add = () => {
    onChange([...value, { ...BLANK }]);
    setFocused(value.length);
  };

  /** Keep row n in sync with row n-1, so repeated keys are typed once. */
  const repeatAbove = (index: number) => {
    const previous = value[index - 1];
    if (!previous) return;
    onChange(
      value.map((row, rowIndex) =>
        rowIndex === index ? { ...row, attribute_name: previous.attribute_name } : row
      )
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-sand-300 px-4 py-6 text-center text-xs text-muted dark:border-walnut-800">
          No specifications yet. Add the material, dimensions or finish a shopper would ask
          about.
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {value.map((row, index) => (
          <li
            key={index}
            className={cn(
              'flex items-center gap-2',
              focused === index && 'rounded-lg ring-2 ring-clay-500/20'
            )}
          >
            <GripVertical
              className="size-4 shrink-0 text-sand-300 dark:text-walnut-800"
              aria-hidden
            />
            <Input
              containerClassName="flex-1"
              value={row.attribute_name}
              disabled={disabled}
              placeholder="Attribute"
              aria-label={`Attribute name for row ${index + 1}`}
              onFocus={() => setFocused(index)}
              onBlur={() => setFocused(null)}
              onChange={(event) => update(index, { attribute_name: event.target.value })}
            />
            <Input
              containerClassName="flex-[1.4]"
              value={row.attribute_value}
              disabled={disabled}
              placeholder="Value"
              aria-label={`Attribute value for row ${index + 1}`}
              onFocus={() => setFocused(index)}
              onBlur={() => setFocused(null)}
              onChange={(event) => update(index, { attribute_value: event.target.value })}
            />
            <div className="flex shrink-0 items-center">
              {index > 0 ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={disabled}
                  title="Repeat the attribute above"
                  onClick={() => repeatAbove(index)}
                >
                  <span className="text-[0.65rem] font-semibold">↑↓</span>
                </Button>
              ) : null}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={disabled}
                title="Remove row"
                aria-label={`Remove specification row ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Plus className="size-3.5" />}
          disabled={disabled}
          onClick={add}
        >
          Add specification
        </Button>
      </div>
    </div>
  );
}
