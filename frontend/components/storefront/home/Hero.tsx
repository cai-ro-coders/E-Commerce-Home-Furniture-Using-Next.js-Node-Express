import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

const STATS = [
  { value: '4,000+', label: 'homes furnished' },
  { value: '12 yr', label: 'frame warranty' },
  { value: '4.9/5', label: 'from 1,200 reviews' },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-walnut-950">
      <img
        src="/images/hero-living.jpg"
        alt="A sunlit living room furnished with a low linen sofa and solid timber table"
        className="absolute inset-0 size-full animate-ken-burns object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-walnut-950/90 via-walnut-950/40 to-walnut-950/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/85 via-transparent to-walnut-950/25" />

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-16 pt-40 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
        <div className="max-w-4xl text-white">
          <p className="flex items-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-clay-200">
            <span className="h-px w-10 bg-clay-200/70" />
            The autumn collection · 2026
          </p>

          <h1 className="mt-6 font-display text-[clamp(3.5rem,9vw,8rem)] font-medium leading-[0.88] tracking-[-0.045em]">
            Luxury for
            <br />
            <span className="italic text-clay-200">Modern</span> Living
          </h1>

          <p className="mt-7 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Furniture with the quiet confidence of things made to stay. Solid timber, natural
            fibres and forms that soften with the years.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-6 text-sm font-semibold text-walnut-950 transition-all duration-300 hover:bg-clay-100"
            >
              Explore the collection
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/#story"
              className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-sm font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
            >
              Our story
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/20 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-xl text-white">{stat.value}</span>
                  <span className="mt-0.5 block text-[0.58rem] font-medium uppercase tracking-[0.2em] text-white/50">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex items-center gap-3 text-[0.58rem] font-medium uppercase tracking-[0.24em] text-white/50">
            <span className="flex size-8 items-center justify-center rounded-full border border-white/25">
              <ArrowDown className="size-3.5 animate-bounce" />
            </span>
            Scroll to discover
          </div>
        </div>
      </div>

      <span className="absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-90 text-[0.55rem] font-medium uppercase tracking-[0.5em] text-white/35 xl:block">
        Manila · Est. 2014
      </span>
    </section>
  );
}
