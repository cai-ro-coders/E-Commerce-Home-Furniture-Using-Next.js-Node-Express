import Link from 'next/link';
import { ArrowUpRight, Leaf, Ruler, Wrench } from 'lucide-react';
import { Reveal } from '@/components/storefront/Reveal';

const PRINCIPLES = [
  {
    icon: Leaf,
    title: 'Materials that age well',
    copy: 'Solid oak, ash, linen and full-grain leather. No veneer pretending to be something it is not.',
  },
  {
    icon: Ruler,
    title: 'Drawn for real rooms',
    copy: 'Every dimension is tested against the way Filipino homes are actually laid out and lived in.',
  },
  {
    icon: Wrench,
    title: 'Made by known hands',
    copy: 'Seven workshops, long relationships, and joinery that can be repaired rather than replaced.',
  },
];

export function PromoStory() {
  return (
    <section id="story" className="scroll-mt-32 bg-sand-50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="grid overflow-hidden rounded-[1.6rem] bg-[#e9e2d6] lg:grid-cols-[1.05fr_1fr]">
            <div className="relative min-h-[420px] overflow-hidden sm:min-h-[520px] lg:min-h-[640px]">
              <img
                src="/images/promo-craft.jpg"
                alt="A warm interior with layered natural textures"
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/40 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">
                <div className="max-w-[15rem] rounded-2xl bg-white/85 p-4 backdrop-blur-md">
                  <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-clay-700">
                    The Lumera standard
                  </p>
                  <p className="mt-1.5 font-display text-lg leading-snug text-walnut-950">
                    Built to be repaired, not replaced.
                  </p>
                </div>
                <img
                  src="/images/story-detail.jpg"
                  alt=""
                  loading="lazy"
                  className="hidden size-28 rounded-2xl border-4 border-white/40 object-cover shadow-lg sm:block lg:size-36"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-clay-700">
                Our story
              </p>
              <h2 className="mt-4 font-display text-[clamp(2.1rem,4vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.03em] text-walnut-950">
                Made slowly.
                <br />
                <span className="italic text-clay-700">Kept for decades.</span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-walnut-950/60">
                Lumera began in a Quezon City workshop with a simple frustration: beautiful
                furniture that could not survive a family. We set out to make the opposite — pieces
                with honest materials, generous proportions and a frame that can be brought back to
                life.
              </p>

              <ul className="mt-8 space-y-5">
                {PRINCIPLES.map(({ icon: Icon, title, copy }) => (
                  <li key={title} className="flex gap-3.5">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-walnut-950/15 text-clay-700">
                      <Icon className="size-3.5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-walnut-950">{title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-walnut-950/55">{copy}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/#brands"
                  className="group inline-flex h-11 items-center gap-2 rounded-full bg-walnut-950 px-5 text-xs font-semibold text-white transition-colors hover:bg-clay-700"
                >
                  Meet the makers
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  href="/about#materials"
                  className="inline-flex h-11 items-center rounded-full border border-walnut-950/25 px-5 text-xs font-semibold text-walnut-950 transition-colors hover:border-walnut-950"
                >
                  Explore the materials
                </Link>
              </div>

              <p className="mt-8 font-display text-sm italic text-walnut-950/45">
                — The Lumera studio, Manila
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
