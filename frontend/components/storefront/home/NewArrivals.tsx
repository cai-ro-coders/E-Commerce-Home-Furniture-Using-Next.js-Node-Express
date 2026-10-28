import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PremiumProductCard } from '@/components/storefront/PremiumProductCard';
import { Reveal } from '@/components/storefront/Reveal';
import { SectionHeading } from './SectionHeading';
import type { Product } from '@/types';

export function NewArrivals({ products, loading }: { products: Product[]; loading: boolean }) {
  return (
    <section id="collections" className="scroll-mt-32 bg-sand-50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Just landed"
            title={
              <>
                New arrivals,
                <br />
                <span className="italic text-clay-700">still unhurried.</span>
              </>
            }
            copy="A small release of pieces we have been refining for months. Limited first runs, made to order in our partner workshops."
            link="/products?sort=newest"
            linkLabel="See everything new"
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <div key={index}>
                  <div className="skeleton aspect-[4/5] rounded-[1.15rem]" />
                  <div className="mt-4 space-y-2">
                    <div className="skeleton h-2.5 w-20" />
                    <div className="skeleton h-4 w-4/5" />
                    <div className="skeleton h-3 w-16" />
                  </div>
                </div>
              ))
            : products.map((product, index) => (
                <Reveal key={product.id} delay={(index % 4) * 80}>
                  <PremiumProductCard product={product} aspect="portrait" badge="New in" />
                </Reveal>
              ))}
        </div>

        {!loading && products.length === 0 ? (
          <p className="mt-10 text-sm text-sand-500">The next release is being photographed.</p>
        ) : null}

        <Reveal delay={120} className="mt-12 flex justify-center">
          <Link
            href="/products?sort=newest"
            className="group inline-flex h-12 items-center gap-2.5 rounded-full border border-sand-300 px-6 text-sm font-semibold text-walnut-950 transition-colors hover:border-walnut-950 hover:bg-walnut-950 hover:text-white"
          >
            Browse all new arrivals
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
