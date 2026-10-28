import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  Armchair,
  Clock,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Ruler,
  ShieldCheck,
  Trees,
  Wrench,
} from 'lucide-react';
import { StoreShell } from '@/components/storefront/StoreShell';
import { Reveal } from '@/components/storefront/Reveal';
import { SectionHeading } from '@/components/storefront/home/SectionHeading';

export const metadata: Metadata = {
  title: 'About the studio',
  description:
    'Lumera Home is a Manila furniture studio making solid-timber and natural-fibre pieces with eight independent workshops. Our story, materials, process and showroom.',
};

const STATS = [
  { value: '2014', label: 'Founded in Quezon City' },
  { value: '8', label: 'Maker studios' },
  { value: '4,000+', label: 'Homes furnished' },
  { value: '12 yr', label: 'Frame warranty' },
];

const PRINCIPLES = [
  {
    icon: Leaf,
    title: 'Materials that age well',
    copy: 'Solid oak, ash, walnut, linen and full-grain leather. We finish timber with oil rather than lacquer, so it can be sanded and brought back instead of replaced.',
  },
  {
    icon: Ruler,
    title: 'Drawn for real rooms',
    copy: 'Every dimension is tested against the way Filipino homes are actually laid out — narrow stairwells, open salas, balconies that catch the afternoon sun.',
  },
  {
    icon: Wrench,
    title: 'Joinery made to be repaired',
    copy: 'Screwed and bolted frames, replaceable covers and hardware we keep in stock. A ten-year-old sofa should still be a sofa, not landfill.',
  },
  {
    icon: Trees,
    title: 'One standard, many hands',
    copy: 'Eight independent workshops, long relationships and a shared sample library. Every maker is named on the product page, never hidden behind ours.',
  },
];

const PROCESS = [
  {
    step: '01',
    title: 'Listen and draw',
    copy: 'We start with the room, the people and the way they live in it. Sketches come before spreadsheets.',
  },
  {
    step: '02',
    title: 'Source and sample',
    copy: 'Timber is selected for grain and stability, then sampled in the finish it will ship in.',
  },
  {
    step: '03',
    title: 'Build and finish',
    copy: 'Frames are joined, sanded and oiled by hand. Upholstery is cut and sewn in the same workshop.',
  },
  {
    step: '04',
    title: 'Deliver and settle',
    copy: 'Our crew assembles, levels and takes the packaging away — then checks back after a month.',
  },
];

const MATERIALS = [
  {
    name: 'Pale oak',
    note: 'Scandinavian clarity',
    swatch: 'linear-gradient(135deg, #ddc9a8 0%, #c4a97d 100%)',
  },
  {
    name: 'Walnut',
    note: 'Deep, quiet grain',
    swatch: 'linear-gradient(135deg, #77513a 0%, #4a2e20 100%)',
  },
  {
    name: 'Belgian linen',
    note: 'Softens with use',
    swatch: 'linear-gradient(135deg, #ded5c6 0%, #bfb3a0 100%)',
  },
  {
    name: 'Full-grain leather',
    note: 'Patina, not wear',
    swatch: 'linear-gradient(135deg, #b0805c 0%, #7b5337 100%)',
  },
];

export default function AboutPage() {
  return (
    <StoreShell fullBleed>
      {/* ------------------------------------------------------------- hero */}
      <section className="relative flex min-h-[74svh] items-end overflow-hidden bg-walnut-950">
        <img
          src="/images/promo-craft.jpg"
          alt="A warm, layered interior with natural timber and woven textures"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-walnut-950/92 via-walnut-950/55 to-walnut-950/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/90 via-transparent to-walnut-950/35" />

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-14 pt-16 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[0.65rem] text-white/55"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white/90">About</span>
          </nav>

          <div className="mt-10 max-w-4xl text-white sm:mt-14">
            <p className="flex items-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-clay-200">
              <span className="h-px w-10 bg-clay-200/70" aria-hidden />
              The studio · Manila · Est. 2014
            </p>

            <h1 className="mt-6 font-display text-[clamp(3rem,7.5vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.04em]">
              Furniture for a
              <br />
              <span className="italic text-clay-200">slower</span> kind of living.
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              We are a small studio making solid-timber and natural-fibre furniture with eight
              independent workshops across the Philippines. One standard, many hands — and pieces
              designed to be repaired, not replaced.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-6 text-sm font-semibold text-walnut-950 transition-all duration-300 hover:bg-clay-100"
              >
                Explore the collection
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/brands"
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-sm font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
              >
                Meet the makers
              </Link>
            </div>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/20 pt-6 sm:grid-cols-4 sm:gap-x-10">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-2xl text-white">{stat.value}</span>
                  <span className="mt-1 block text-[0.56rem] font-medium uppercase tracking-[0.2em] text-white/50">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* -------------------------------------------------------- manifesto */}
      <section className="bg-sand-50 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8 lg:px-10">
          <Reveal>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-clay-700">
              What we believe
            </p>
            <p className="mt-5 font-display text-[clamp(1.9rem,4vw,3.3rem)] font-medium leading-[1.12] tracking-[-0.025em] text-walnut-950">
              A room should get <span className="italic text-clay-700">better</span> as it is
              lived in.
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-walnut-950/60 sm:text-base">
              Furniture is one of the few things in a home that gets touched every single day. It
              should feel better in year ten than it did in week one — the timber darker, the linen
              softer, the frame still square. That is the whole brief.
            </p>
            <p className="mt-7 font-display text-sm italic text-walnut-950/45">
              — The Lumera studio, Manila
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- story */}
      <section className="bg-[#f7f3ec] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
            <Reveal className="relative">
              <div className="overflow-hidden rounded-[1.6rem]">
                <img
                  src="/images/story-detail.jpg"
                  alt="Detail of a hand-finished timber joint and woven upholstery"
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 right-4 hidden max-w-[13rem] rounded-2xl bg-white p-5 shadow-[var(--shadow-lift)] sm:block lg:-right-6">
                <p className="font-display text-2xl text-walnut-950">Since 2014</p>
                <p className="mt-1 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-sand-500">
                  One workshop, eight makers
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <SectionHeading
                eyebrow="Our story"
                title={
                  <>
                    It started with a
                    <br />
                    <span className="italic text-clay-700">wobbly chair.</span>
                  </>
                }
              />
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-walnut-950/60">
                <p>
                  In 2014, our founder bought a dining set that looked right in the showroom and
                  fell apart within two years. The joints had been glued and stapled, the “oak” was
                  a veneer, and there was no way to repair any of it. The frustration was simple:
                  beautiful furniture that could not survive a family.
                </p>
                <p>
                  We started with one bench, one workshop and a rule that still holds — if we cannot
                  explain how a piece is made, we do not sell it. That meant finding makers who
                  worked the way we wanted to buy: slowly, with solid timber, honest joinery and
                  finishes that could be renewed.
                </p>
                <p>
                  Today the catalogue spans living, dining, bedroom, workspace and outdoor pieces.
                  What has not changed is the sample library, the named makers and the repair kit
                  that ships with every frame.
                </p>
              </div>

              <Link
                href="/products"
                className="group mt-7 inline-flex items-center gap-2 border-b border-sand-300 pb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-walnut-950 transition-colors hover:border-clay-600 hover:text-clay-700"
              >
                See what we make
                <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- principles */}
      <section className="bg-sand-50 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="The Lumera standard"
              title={
                <>
                  Four things we will not{' '}
                  <span className="italic text-clay-700">compromise</span>.
                </>
              }
              copy="They are not slogans. They are the checks every piece passes before it earns a place in the catalogue."
            />
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map(({ icon: Icon, title, copy }, index) => (
              <Reveal
                key={title}
                delay={index * 80}
                className="flex flex-col rounded-[1.4rem] border border-sand-200 bg-[#f7f3ec] p-6 transition-colors duration-300 hover:border-clay-300"
              >
                <span className="flex size-11 items-center justify-center rounded-full border border-sand-300 text-clay-700">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg leading-snug text-walnut-950">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-sand-500">{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- process */}
      <section className="border-y border-sand-200 bg-[#ede7dc] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="How it is made"
              title={
                <>
                  From sketch to <span className="italic text-clay-700">doorway</span>.
                </>
              }
              copy="Most pieces take eight to twelve weeks. Nothing is rushed to a container, and nothing leaves the workshop without a final inspection."
            />
          </Reveal>

          <ol className="mt-12 grid gap-px overflow-hidden rounded-[1.4rem] border border-walnut-950/10 bg-walnut-950/10 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map(({ step, title, copy }, index) => (
              <Reveal as="li" key={step} delay={index * 80} className="bg-[#f7f3ec] p-7">
                <span className="font-display text-3xl text-clay-700/45">{step}</span>
                <h3 className="mt-4 text-sm font-semibold text-walnut-950">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-sand-500">{copy}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* --------------------------------------------------------- materials */}
      <section id="materials" className="scroll-mt-28 bg-sand-50 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
            <Reveal>
              <SectionHeading
                eyebrow="The palette"
                title={
                  <>
                    Materials we can{' '}
                    <span className="italic text-clay-700">stand behind</span>.
                  </>
                }
                copy="We keep the palette small on purpose. Fewer materials, better understood, finished so they can be renewed rather than replaced."
              />

              <ul className="mt-8 space-y-3">
                {MATERIALS.map((material) => (
                  <li
                    key={material.name}
                    className="flex items-center gap-4 border-b border-sand-200 pb-3 last:border-b-0"
                  >
                    <span
                      className="size-10 shrink-0 rounded-full ring-1 ring-inset ring-walnut-950/10"
                      style={{ background: material.swatch }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-walnut-950">{material.name}</p>
                      <p className="mt-0.5 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-sand-500">
                        {material.note}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120} className="grid grid-cols-2 gap-3 sm:gap-4">
              <img
                src="/images/category-living.jpg"
                alt="A living room with a low linen sofa and solid timber table"
                loading="lazy"
                className="aspect-[3/4] w-full rounded-[1.4rem] object-cover"
              />
              <img
                src="/images/category-dining.jpg"
                alt="A dining room with a warm timber table and woven chairs"
                loading="lazy"
                className="mt-8 aspect-[3/4] w-full rounded-[1.4rem] object-cover"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ makers */}
      <section className="relative overflow-hidden bg-walnut-950 py-20 text-white sm:py-24 lg:py-28">
        <div
          className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-clay-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8 lg:px-10">
          <Reveal>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-clay-200">
              The makers
            </p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.03em]">
              Eight studios.
              <br />
              <span className="italic text-clay-200">One standard.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/60">
              We do not own every workshop, and we do not pretend to. Each maker is independent,
              named and credited — from the rattan specialists on the coast to the timber
              workshops in the north.
            </p>
            <Link
              href="/brands"
              className="group mt-8 inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-6 text-sm font-semibold text-walnut-950 transition-colors duration-300 hover:bg-clay-100"
            >
              Meet the makers
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- visit */}
      <section id="visit" className="scroll-mt-28 bg-[#f7f3ec] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="grid overflow-hidden rounded-[1.6rem] border border-sand-200 bg-sand-50 lg:grid-cols-[1.05fr_1fr]">
              <div className="p-7 sm:p-10 lg:p-12">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-clay-700">
                  Visit the studio
                </p>
                <h2 className="mt-4 font-display text-[clamp(1.9rem,3.5vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.025em] text-walnut-950">
                  Come sit in the pieces.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-walnut-950/60">
                  Photographs only get you so far. The showroom holds the full sample library, a
                  rotating edit of the collection and the repair bench where we test every finish.
                </p>

                <dl className="mt-8 space-y-4 text-sm text-walnut-950/70">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-clay-700" aria-hidden />
                    <div>
                      <dt className="sr-only">Address</dt>
                      <dd>112 Katipunan Avenue, Quezon City</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-clay-700" aria-hidden />
                    <div>
                      <dt className="sr-only">Opening hours</dt>
                      <dd>Mon–Sat, 10am–7pm · Sunday by appointment</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-clay-700" aria-hidden />
                    <div>
                      <dt className="sr-only">Phone</dt>
                      <dd>
                        <a href="tel:+63285550142" className="hover:text-clay-700">
                          +63 2 8555 0142
                        </a>
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-clay-700" aria-hidden />
                    <div>
                      <dt className="sr-only">Email</dt>
                      <dd>
                        <a href="mailto:hello@lumerahome.com" className="hover:text-clay-700">
                          hello@lumerahome.com
                        </a>
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href="mailto:hello@lumerahome.com?subject=Showroom%20visit"
                    className="group inline-flex h-11 items-center gap-2 rounded-full bg-walnut-950 px-5 text-xs font-semibold text-white transition-colors hover:bg-clay-700"
                  >
                    Book a visit
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                  <Link
                    href="/products"
                    className="inline-flex h-11 items-center rounded-full border border-walnut-950/25 px-5 text-xs font-semibold text-walnut-950 transition-colors hover:border-walnut-950"
                  >
                    Browse before you come
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[320px] lg:min-h-full">
                <img
                  src="/images/featured-suite.jpg"
                  alt="A furnished room in the Lumera Home showroom"
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/45 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">
                  <div className="rounded-2xl bg-white/85 p-4 backdrop-blur-md">
                    <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-clay-700">
                      The showroom
                    </p>
                    <p className="mt-1 font-display text-lg leading-snug text-walnut-950">
                      Katipunan Avenue, Quezon City
                    </p>
                  </div>
                  <span className="hidden size-12 items-center justify-center rounded-full border border-white/40 text-white sm:flex">
                    <Armchair className="size-5" aria-hidden />
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-sand-500">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-clay-700" aria-hidden />
              12-year structural warranty
            </span>
            <span className="inline-flex items-center gap-2">
              <Trees className="size-3.5 text-clay-700" aria-hidden />
              Responsibly sourced timber
            </span>
            <span className="inline-flex items-center gap-2">
              <Wrench className="size-3.5 text-clay-700" aria-hidden />
              Repair service for every frame
            </span>
          </Reveal>
        </div>
      </section>
    </StoreShell>
  );
}
