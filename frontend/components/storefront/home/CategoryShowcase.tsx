import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/storefront/Reveal';
import { SectionHeading } from './SectionHeading';
import { categoryIcon } from '@/components/storefront/categoryIcons';
import type { Category } from '@/types';

const IMAGES: Record<string, string> = {
  'living-room': '/images/category-living.jpg',
  bedroom: '/images/category-bedroom.jpg',
  'dining-room': '/images/category-dining.jpg',
  'office-study': '/images/category-office.jpg',
  'outdoor-patio': '/images/category-outdoor.jpg',
  'decor-lighting': '/images/category-decor.jpg',
  'kitchen-storage': '/images/promo-craft.jpg',
  'kids-nursery': '/images/story-detail.jpg',
};

const ORDER = [
  'living-room',
  'bedroom',
  'dining-room',
  'office-study',
  'outdoor-patio',
  'decor-lighting',
];

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const roots = categories.filter((category) => !category.parent_id && category.status === 'active');
  const ordered = [
    ...ORDER.map((slug) => roots.find((category) => category.slug === slug)).filter(
      (category): category is Category => Boolean(category)
    ),
    ...roots.filter((category) => !ORDER.includes(category.slug)),
  ].slice(0, 6);

  return (
    <section className="bg-sand-50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Find your room"
            title={
              <>
                Shop by
                <br />
                <span className="italic text-clay-700">category</span>
              </>
            }
            copy="Start with the way you live, not a SKU. Every collection is edited around a room and the rituals that happen in it."
            link="/categories"
            linkLabel="View all categories"
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {ordered.map((category, index) => {
            const Icon = categoryIcon(category.slug);
            const childrenCount = (category.children ?? []).reduce(
              (total, child) => total + (child.product_count ?? 0),
              category.product_count ?? 0
            );

            return (
              <Reveal key={category.id} delay={(index % 3) * 90}>
                <Link
                  href={`/products/${category.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-walnut-950"
                >
                  <img
                    src={IMAGES[category.slug] ?? '/images/category-living.jpg'}
                    alt={category.name}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/90 via-walnut-950/15 to-walnut-950/15 transition-opacity duration-500 group-hover:from-walnut-950/95" />

                  <div className="relative flex h-full flex-col justify-between p-4 text-white sm:p-5">
                    <div className="flex items-start justify-between">
                      <span className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm">
                        <Icon className="size-4" />
                      </span>
                      <span className="font-display text-[0.65rem] tracking-[0.2em] text-white/50">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div>
                      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-white/50">
                        {childrenCount > 0 ? `${childrenCount} considered pieces` : 'Explore the edit'}
                      </p>
                      <div className="mt-1.5 flex items-end justify-between gap-3">
                        <h3 className="font-display text-[1.45rem] leading-none sm:text-[1.7rem]">
                          {category.name}
                        </h3>
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/30 transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-walnut-950">
                          <ArrowUpRight className="size-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
