import { RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { Reveal } from '@/components/storefront/Reveal';

const FEATURES = [
  {
    icon: Truck,
    title: 'Free Shipping',
    copy: 'Complimentary white-glove delivery on orders over ₱25,000.',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    copy: 'Live with it for 30 days. If the room is not right, we will collect it.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Checkout',
    copy: 'Encrypted payments and a 12-year structural warranty on every frame.',
  },
];

export function FeatureStrip() {
  return (
    <section className="border-b border-sand-200 bg-[#f7f3ec]">
      <div className="mx-auto grid max-w-[1400px] divide-y divide-sand-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-10">
        {FEATURES.map(({ icon: Icon, title, copy }, index) => (
          <Reveal
            key={title}
            delay={index * 100}
            className="flex items-start gap-4 py-7 sm:px-7 sm:first:pl-0 sm:last:pr-0"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-sand-300 text-clay-700">
              <Icon className="size-4" />
            </span>
            <div>
              <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-walnut-950">
                {title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-sand-500">{copy}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
