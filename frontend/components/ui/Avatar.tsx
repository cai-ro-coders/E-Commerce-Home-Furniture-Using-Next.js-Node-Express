import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import { imageUrl } from '@/lib/api';
import { initials } from '@/lib/format';

const AVATAR_SIZES = {
  xs: 'size-6 text-[0.6rem]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-base',
  xl: 'size-20 text-xl',
} as const;

export function Avatar({
  src,
  name,
  size = 'md',
  className,
  ring = false,
}: {
  src?: string | null;
  name?: string | null;
  size?: keyof typeof AVATAR_SIZES;
  className?: string;
  ring?: boolean;
}) {
  const label = initials(name);

  if (src) {
    return (
      // Uploaded avatars are SVG placeholders; see `next.config.ts`.
      <img
        src={imageUrl(src)}
        alt={name ?? 'Avatar'}
        loading="lazy"
        className={cn(
          'shrink-0 rounded-full object-cover',
          AVATAR_SIZES[size],
          ring && 'ring-2 ring-white dark:ring-walnut-900',
          className
        )}
      />
    );
  }

  return (
    <span
      aria-hidden
      title={name ?? undefined}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-clay-100 font-semibold uppercase text-clay-700 dark:bg-clay-500/20 dark:text-clay-300',
        AVATAR_SIZES[size],
        ring && 'ring-2 ring-white dark:ring-walnut-900',
        className
      )}
    >
      {label}
    </span>
  );
}

/** Read-only star row; `value` may be fractional. */
export function StarRating({
  value,
  count,
  size = 'sm',
  showValue = false,
  className,
}: {
  value: number | string | null | undefined;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}) {
  const rating = Number(value ?? 0);
  const starSize = size === 'lg' ? 'size-5' : size === 'md' ? 'size-4' : 'size-3.5';

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => {
          // 4.4 renders 4 full stars + a 40% one.
          const fill = Math.max(0, Math.min(1, rating - star + 1));
          return (
            <span key={star} className={cn('relative', starSize)}>
              <Star className={cn('absolute inset-0 text-sand-300 dark:text-walnut-800', starSize)} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className={cn('fill-amber-400 text-amber-400', starSize)} />
              </span>
            </span>
          );
        })}
      </span>
      {showValue ? (
        <span className="text-xs font-semibold text-sand-700 dark:text-sand-300">
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
      ) : null}
      {typeof count === 'number' ? (
        <span className="text-xs text-muted">({count})</span>
      ) : null}
      <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
    </span>
  );
}

/** Interactive star picker used by the review form. */
export function StarPicker({
  value,
  onChange,
  size = 'lg',
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}) {
  const starSize = size === 'lg' ? 'size-7' : size === 'md' ? 'size-5' : 'size-4';

  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          disabled={disabled}
          onClick={() => onChange(star)}
          className="rounded transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Star
            className={cn(
              starSize,
              star <= value ? 'fill-amber-400 text-amber-400' : 'text-sand-300 dark:text-walnut-800'
            )}
          />
        </button>
      ))}
    </div>
  );
}
