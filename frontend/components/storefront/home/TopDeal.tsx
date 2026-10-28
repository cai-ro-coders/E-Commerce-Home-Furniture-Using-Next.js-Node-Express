'use client';

/**
 * The editorial deal block.
 *
 * The deadline is created after mount so server and client markup agree; until
 * then the boxes show dashes. Finish selection is presentation only — the cart
 * line is for the product itself — but it gives the block the feel of a real
 * configurable offer.
 */
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Clock3, ShoppingBag, Sparkles } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { useStoreUI } from '@/components/providers/StoreUIProvider';
import { StarRating } from '@/components/ui/Avatar';
import { imageUrl } from '@/lib/api';
import { discountLabel, formatMoney, num } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Product } from '@/types';

const FINISHES = [
  { name: 'Natural linen', color: '#d7c8b0' },
  { name: 'Smoked oak', color: '#6d4f39' },
  { name: 'Forest wool', color: '#59604a' },
];

export function TopDeal({ product, loading }: { product: Product | null; loading: boolean }) {
  const { addToCart } = useStore();
  const { openCart } = useStoreUI();
  const [deadline, setDeadline] = useState<number | null>(null);
  const [finish, setFinish] = useState(FINISHES[0].name);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setDeadline(Date.now() + (2 * 86_400 + 14 * 3_600 + 38 * 60 + 11) * 1000);
  }, []);

  const remaining = useCountdown(deadline);

  const discount = product?.sale_price
    ? discountLabel(product.price, product.sale_price)
    : null;

  const savings = useMemo(() => {
    if (!product?.sale_price) return 0;
    return Math.max(0, num(product.price) - num(product.sale_price));
  }, [product]);

  const add = async () => {
    if (!product) return;
    setAdding(true);
    const ok = await addToCart(product.id, 1, product.name);
    setAdding(false);
    if (ok) openCart();
  };

  return (
    <section className="relative overflow-hidden bg-walnut-950 py-20 text-white sm:py-24 lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 15%, #fff 0, transparent 32%), radial-gradient(circle at 85% 85%, #d06f38 0, transparent 38%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_1fr] lg:gap-16">
          <div className="relative">
            {loading || !product ? (
              <div className="skeleton aspect-[4/5] rounded-[1.6rem] opacity-20 sm:aspect-[5/4] lg:aspect-[4/5]" />
            ) : (
              <>
                <div className="relative overflow-hidden rounded-[1.6rem] bg-walnut-900">
                  <img
                    src={imageUrl(product.primary_image)}
                    alt={product.name}
                    className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/45 via-transparent to-transparent" />

                  <span className="absolute left-5 top-5 rounded-full bg-clay-600 px-3.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white">
                    {discount ?? 'This week'} off
                  </span>

                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.24em] text-white/55">
                        The featured piece
                      </p>
                      <p className="mt-1 font-display text-xl text-white">{product.name}</p>
                    </div>
                    <span className="flex size-10 items-center justify-center rounded-full border border-white/30 backdrop-blur">
                      <Sparkles className="size-4" />
                    </span>
                  </div>
                </div>

                <div className="absolute -bottom-5 -right-3 hidden w-44 rounded-2xl bg-[#f7f3ec] p-4 text-walnut-950 shadow-2xl sm:block lg:-right-7">
                  <p className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-clay-700">
                    You save
                  </p>
                  <p className="mt-1 font-display text-2xl">
                    {formatMoney(savings, 'PHP', { decimals: 0 })}
                  </p>
                  <p className="mt-1 text-[0.62rem] leading-relaxed text-sand-500">
                    on this week&apos;s featured piece. Ends Sunday.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="lg:pl-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-clay-200">
                The weekly deal
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.14em] text-white/65">
                <Clock3 className="size-3" />
                Ends in
              </span>
            </div>

            <h2 className="mt-4 font-display text-[clamp(2.2rem,4.5vw,4rem)] font-medium leading-[1.02] tracking-[-0.03em]">
              One piece.
              <br />
              <span className="italic text-clay-200">One week only.</span>
            </h2>

            <div className="mt-7 flex flex-wrap gap-2.5" aria-live="polite">
              {[
                { value: remaining.days, label: 'Days' },
                { value: remaining.hours, label: 'Hours' },
                { value: remaining.minutes, label: 'Mins' },
                { value: remaining.seconds, label: 'Secs' },
              ].map((unit) => (
                <div
                  key={unit.label}
                  className="flex min-w-[4.2rem] flex-col items-center rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2.5 backdrop-blur-sm"
                >
                  <span className="font-display text-2xl tabular-nums text-white">
                    {deadline ? String(unit.value).padStart(2, '0') : '--'}
                  </span>
                  <span className="mt-0.5 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            {product ? (
              <>
                <div className="mt-8 flex items-center gap-3">
                  {num(product.avg_rating) > 0 ? (
                    <StarRating value={product.avg_rating} size="sm" />
                  ) : (
                    <Sparkles className="size-3.5 text-clay-200" />
                  )}
                  <span className="text-[0.7rem] text-white/50">
                    {num(product.avg_rating) > 0
                      ? `${Number(product.avg_rating).toFixed(1)} · ${product.review_count ?? 0} reviews`
                      : 'A studio favourite'}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-3xl leading-tight text-white sm:text-4xl">
                  {product.name}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/55">
                  {product.short_description ??
                    'The piece our studio keeps coming back to — generous, quiet and built around the way a room actually gets used.'}
                </p>

                <div className="mt-6 flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-3xl text-clay-200">
                    {formatMoney(product.sale_price ?? product.price, 'PHP', { decimals: 0 })}
                  </span>
                  {product.sale_price ? (
                    <span className="text-base text-white/35 line-through">
                      {formatMoney(product.price, 'PHP', { decimals: 0 })}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/65">
                    {product.stock_quantity} in stock
                  </span>
                </div>

                <div className="mt-7">
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-white/40">
                    Finish · <span className="text-white/80">{finish}</span>
                  </p>
                  <div className="mt-2.5 flex gap-2.5" role="radiogroup" aria-label="Choose a finish">
                    {FINISHES.map((option) => (
                      <button
                        key={option.name}
                        type="button"
                        role="radio"
                        aria-checked={finish === option.name}
                        aria-label={option.name}
                        onClick={() => setFinish(option.name)}
                        className={cn(
                          'relative flex size-9 items-center justify-center rounded-full border-2 transition-all',
                          finish === option.name
                            ? 'border-white'
                            : 'border-white/20 hover:border-white/50'
                        )}
                      >
                        <span
                          className="size-6 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={adding || product.stock_quantity <= 0}
                    onClick={() => void add()}
                    className="inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-6 text-sm font-semibold text-walnut-950 transition-colors hover:bg-clay-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingBag className="size-4" />
                    {adding ? 'Adding…' : 'Add to bag'}
                  </button>
                  <a
                    href={`/products/${product.slug}`}
                    className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                  >
                    View the piece
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>

                <p className="mt-5 text-[0.65rem] leading-relaxed text-white/35">
                  Complimentary white-glove delivery · 30-day returns · 12-year frame warranty
                </p>
              </>
            ) : (
              <div className="mt-8 space-y-3">
                <div className="skeleton h-4 w-40 opacity-20" />
                <div className="skeleton h-10 w-3/4 opacity-20" />
                <div className="skeleton h-14 w-52 opacity-20" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function useCountdown(deadline: number | null) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!deadline) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  const total = deadline && now ? Math.max(0, deadline - now) : 0;
  const seconds = Math.floor(total / 1000);

  return {
    days: Math.floor(seconds / 86_400),
    hours: Math.floor((seconds % 86_400) / 3_600),
    minutes: Math.floor((seconds % 3_600) / 60),
    seconds: seconds % 60,
  };
}
