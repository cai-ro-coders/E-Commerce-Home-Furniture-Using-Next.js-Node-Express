import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export function SectionHeading({
  eyebrow,
  title,
  copy,
  link,
  linkLabel,
  align = 'left',
  dark = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  copy?: string;
  link?: string;
  linkLabel?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center'
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        <p
          className={cn(
            'text-[0.6rem] font-semibold uppercase tracking-[0.28em]',
            dark ? 'text-clay-200' : 'text-clay-700'
          )}
        >
          {eyebrow}
        </p>
        <h2
          className={cn(
            'mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.02] tracking-[-0.03em]',
            dark ? 'text-white' : 'text-walnut-950'
          )}
        >
          {title}
        </h2>
        {copy ? (
          <p
            className={cn(
              'mt-4 max-w-xl text-sm leading-relaxed',
              align === 'center' && 'mx-auto',
              dark ? 'text-white/55' : 'text-sand-500'
            )}
          >
            {copy}
          </p>
        ) : null}
      </div>

      {link && linkLabel ? (
        <Link
          href={link}
          className={cn(
            'group inline-flex shrink-0 items-center gap-2 border-b pb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors',
            dark
              ? 'border-white/25 text-white hover:border-white'
              : 'border-sand-300 text-walnut-950 hover:border-clay-600 hover:text-clay-700'
          )}
        >
          {linkLabel}
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
