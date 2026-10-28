import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/storefront/Reveal';
import { SectionHeading } from './SectionHeading';
import { imageUrl } from '@/lib/api';
import type { Brand } from '@/types';

export function BrandStrip({ brands }: { brands: Brand[] }) {
  return (
    <section id="brands" className="scroll-mt-32 border-y border-sand-200 bg-[#f7f3ec] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="The makers"
            title={
              <>
                Shop by
                <br />
                <span className="italic text-clay-700">brand</span>
              </>
            }
            copy="Seven independent studios and workshops. Different hands, one shared standard for material, proportion and repair."
            link="/products"
            linkLabel="Browse all pieces"
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {brands.map((brand, index) => (
            <Reveal key={brand.id} delay={(index % 4) * 70}>
              <Link
                href={`/brands/${brand.slug}`}
                className="group flex min-h-[7.5rem] flex-col items-center justify-center gap-3 rounded-2xl border border-sand-200 bg-sand-50 px-4 py-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-clay-300 hover:shadow-[var(--shadow-lift)]"
              >
                {brand.logo ? (
                  <img
                    src={imageUrl(brand.logo)}
                    alt={brand.name}
                    loading="lazy"
                    className="h-8 max-w-[8.5rem] object-contain opacity-65 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 sm:h-9"
                  />
                ) : (
                  <span className="font-display text-lg text-walnut-950">{brand.name}</span>
                )}
                <span className="flex items-center gap-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-sand-400 transition-colors group-hover:text-clay-700">
                  Shop the studio
                  <ArrowUpRight className="size-3" />
                </span>
              </Link>
            </Reveal>
          ))}

          <Reveal delay={(brands.length % 4) * 70}>
            <Link
              href="/contact#trade"
              className="group flex min-h-[7.5rem] flex-col justify-between rounded-2xl bg-walnut-950 p-5 text-white transition-colors hover:bg-clay-800"
            >
              <span className="flex size-8 items-center justify-center rounded-full border border-white/25">
                <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span>
                <span className="block text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                  For designers
                </span>
                <span className="mt-1 block font-display text-lg leading-tight">
                  Join the trade programme
                </span>
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
