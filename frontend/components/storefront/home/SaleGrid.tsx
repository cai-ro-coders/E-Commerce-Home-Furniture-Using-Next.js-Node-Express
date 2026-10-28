import { PremiumProductCard } from '@/components/storefront/PremiumProductCard';
import { Reveal } from '@/components/storefront/Reveal';
import { SectionHeading } from './SectionHeading';
import type { Product } from '@/types';

export function SaleGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  return (
    <section className="border-y border-sand-200 bg-[#f7f3ec] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="For a limited season"
            title={
              <>
                Considered pieces,
                <br />
                <span className="italic text-clay-700">quietly on sale.</span>
              </>
            }
            copy="Last season's fabrics, this season's favourites. The same materials and joinery, with a little more room in the price."
            link="/products?on_sale=true"
            linkLabel="Shop all sale"
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }, (_, index) => (
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
                <Reveal key={product.id} delay={(index % 4) * 70}>
                  <PremiumProductCard product={product} />
                </Reveal>
              ))}
        </div>

        {!loading && products.length === 0 ? (
          <p className="mt-10 text-sm text-sand-500">The sale is being refreshed. Check back shortly.</p>
        ) : null}
      </div>
    </section>
  );
}
