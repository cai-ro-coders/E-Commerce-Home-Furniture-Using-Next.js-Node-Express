import Link from 'next/link';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { Reveal } from '@/components/storefront/Reveal';
import { imageUrl } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import type { Product } from '@/types';

export function FeaturedBanner({ products }: { products: Product[] }) {
  return (
    <section className="relative overflow-hidden bg-walnut-950">
      <img
        src="/images/featured-suite.jpg"
        alt="A serene living room in warm neutral tones"
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-walnut-950/90 via-walnut-950/55 to-walnut-950/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/60 via-transparent to-transparent" />

      <div className="relative mx-auto flex min-h-[640px] max-w-[1400px] flex-col justify-center px-5 py-20 sm:px-8 sm:py-24 lg:min-h-[720px] lg:px-10">
        <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="max-w-2xl text-white">
            <p className="flex items-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-clay-200">
              <span className="h-px w-10 bg-clay-200/70" />
              Featured collection
            </p>
            <h2 className="mt-5 font-display text-[clamp(2.6rem,6vw,5.6rem)] font-medium leading-[0.94] tracking-[-0.04em]">
              Soft forms.
              <br />
              <span className="italic text-clay-200">Honest materials.</span>
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/65 sm:text-base">
              The Autumn Suite is our most complete room yet: low, generous seating, warm timber
              and light that knows how to linger. Built as a family of pieces, made to be arranged
              your way.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/products?featured=true"
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-6 text-sm font-semibold text-walnut-950 transition-colors hover:bg-clay-100"
              >
                Shop the featured pieces
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                <CalendarDays className="size-4" />
                Book a styling session
              </Link>
            </div>
          </Reveal>

          {products.length > 0 ? (
            <Reveal delay={150} className="lg:justify-self-end">
              <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/15 px-5 py-4 text-white">
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-white/65">
                    In this room
                  </p>
                  <Link
                    href="/products?featured=true"
                    className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/80 hover:text-white"
                  >
                    See all
                  </Link>
                </div>
                <ul className="divide-y divide-white/10">
                  {products.slice(0, 3).map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/products/${product.slug}`}
                        className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/5"
                      >
                        <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
                          {product.primary_image ? (
                            <img
                              src={imageUrl(product.primary_image)}
                              alt=""
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium text-white">
                            {product.name}
                          </span>
                          <span className="mt-0.5 block text-[0.65rem] text-white/45">
                            {product.category_name}
                          </span>
                          <span className="mt-1 block text-[0.7rem] font-semibold tabular-nums text-clay-200">
                            {formatMoney(
                              product.sale_price ?? product.price,
                              'PHP',
                              { decimals: 0 }
                            )}
                          </span>
                        </span>
                        <ArrowUpRight className="size-3.5 text-white/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
