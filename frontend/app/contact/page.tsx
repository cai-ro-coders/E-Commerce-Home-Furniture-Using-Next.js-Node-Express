import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Clock, Mail, MapPin, Phone, Plus } from 'lucide-react';
import { ContactForm } from '@/components/storefront/ContactForm';
import { Reveal } from '@/components/storefront/Reveal';
import { StoreShell } from '@/components/storefront/StoreShell';
import { SectionHeading } from '@/components/storefront/home/SectionHeading';

export const metadata: Metadata = {
  title: 'Contact the studio',
  description:
    'Questions about a piece, delivery, a repair or a whole room? Contact Lumera Home — write to the studio, call the showroom, or visit us on Katipunan Avenue, Quezon City.',
};

const FAQS = [
  {
    id: 'delivery',
    question: 'How long does delivery take?',
    answer:
      'In-stock pieces usually reach Metro Manila addresses in five to ten working days, and provincial addresses in two to three weeks. Made-to-order pieces take eight to twelve weeks because they are built after you order. White-glove delivery, assembly and packaging removal are included on orders over ₱25,000.',
  },
  {
    id: 'returns',
    question: 'Can I return a piece if the room is not right?',
    answer:
      'Yes — stock pieces can be returned within 30 days in their original condition, and we will collect them. Made-to-order and custom pieces are excluded, but if a dimension is wrong on our side we will remake or adjust it at no cost.',
  },
  {
    id: 'care',
    question: 'How do I care for solid timber and linen?',
    answer:
      'Dust with a dry cloth and re-oil timber once or twice a year with the kit that ships with every frame. Keep pieces out of direct afternoon sun and avoid silicone polishes. Linen covers unzip and can be dry-cleaned; we also keep replacement covers in stock.',
  },
  {
    id: 'trade',
    question: 'Do you work with interior designers and trade clients?',
    answer:
      'We do. The trade programme includes a full sample library, CAD blocks and dimensions, project pricing, and a named studio contact. Write to us with “Trade & interior design” selected and a little about the project.',
  },
  {
    id: 'custom',
    question: 'Can you make a piece to a custom size?',
    answer:
      'Many pieces can be adjusted in width, depth or finish. Send the dimensions and a photograph of the room and we will tell you what is straightforward, what changes the structure, and what it costs before anything is cut.',
  },
  {
    id: 'visit',
    question: 'Can I see the pieces in person first?',
    answer:
      'The showroom holds the full sample library, a rotating edit of the collection and the repair bench where finishes are tested. Walk in Monday to Saturday, 10am–7pm, or book a Sunday appointment by email.',
  },
];

export default function ContactPage() {
  return (
    <StoreShell fullBleed>
      {/* ------------------------------------------------------------- hero */}
      <section className="relative flex min-h-[58svh] items-end overflow-hidden bg-walnut-950">
        <img
          src="/images/category-decor.jpg"
          alt="A quiet corner of a Lumera Home room with woven and timber details"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-walnut-950/92 via-walnut-950/55 to-walnut-950/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/90 via-transparent to-walnut-950/35" />

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-12 pt-16 sm:px-8 sm:pb-14 lg:px-10 lg:pb-16">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[0.65rem] text-white/55"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white/90">Contact</span>
          </nav>

          <div className="mt-10 max-w-3xl text-white sm:mt-12">
            <p className="flex items-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-clay-200">
              <span className="h-px w-10 bg-clay-200/70" aria-hidden />
              Contact · Manila studio
            </p>

            <h1 className="mt-6 font-display text-[clamp(2.8rem,6.5vw,5.4rem)] font-medium leading-[0.94] tracking-[-0.04em]">
              Tell us about
              <br />
              the <span className="italic text-clay-200">room</span>.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              A question about a piece, a delivery, a repair, or a whole room from scratch — write
              to us and someone from the studio will answer.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="mailto:hello@lumerahome.com"
                className="group inline-flex h-11 items-center gap-2.5 rounded-full bg-white px-5 text-sm font-semibold text-walnut-950 transition-colors duration-300 hover:bg-clay-100"
              >
                <Mail className="size-4" aria-hidden />
                hello@lumerahome.com
              </a>
              <a
                href="tel:+63285550142"
                className="inline-flex h-11 items-center gap-2.5 rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
              >
                <Phone className="size-4" aria-hidden />
                +63 2 8555 0142
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ form + studio */}
      <section className="bg-[#f7f3ec] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:px-10">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={120}>
            <aside className="flex h-full flex-col gap-4">
              <div className="rounded-[1.6rem] border border-sand-200 bg-[#ede7dc] p-6 sm:p-8">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-clay-700">
                  Other ways to reach us
                </p>
                <h2 className="mt-3 font-display text-2xl leading-tight tracking-[-0.02em] text-walnut-950">
                  The studio, not a call centre.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-walnut-950/60">
                  The same small team answers the phone, the inbox and the showroom door. If you
                  leave a message, a person will come back to you.
                </p>

                <dl className="mt-7 space-y-5 text-sm text-walnut-950/70">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-clay-700" aria-hidden />
                    <div>
                      <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-sand-500">
                        Showroom
                      </dt>
                      <dd className="mt-1">112 Katipunan Avenue, Quezon City</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-clay-700" aria-hidden />
                    <div>
                      <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-sand-500">
                        Hours
                      </dt>
                      <dd className="mt-1">Mon–Sat, 10am–7pm · Sunday by appointment</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-clay-700" aria-hidden />
                    <div>
                      <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-sand-500">
                        Phone
                      </dt>
                      <dd className="mt-1">
                        <a href="tel:+63285550142" className="hover:text-clay-700">
                          +63 2 8555 0142
                        </a>
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-clay-700" aria-hidden />
                    <div>
                      <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-sand-500">
                        Email
                      </dt>
                      <dd className="mt-1">
                        <a href="mailto:hello@lumerahome.com" className="hover:text-clay-700">
                          hello@lumerahome.com
                        </a>
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-7 border-t border-walnut-950/10 pt-5">
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-sand-500">
                    Response time
                  </p>
                  <p className="mt-1 text-sm text-walnut-950/70">
                    Usually within one working day, Monday to Saturday.
                  </p>
                </div>
              </div>

              <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-[1.6rem]">
                <img
                  src="/images/featured-suite.jpg"
                  alt="A furnished room in the Lumera Home showroom"
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/70 via-walnut-950/10 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6">
                  <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-clay-200">
                    The showroom
                  </p>
                  <p className="mt-1 font-display text-lg leading-snug text-white">
                    Katipunan Avenue, Quezon City
                  </p>
                </div>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------- faq */}
      <section id="faq" className="scroll-mt-28 bg-sand-50 py-20 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="Before you write"
              title={
                <>
                  Answers to the <span className="italic text-clay-700">usual</span> questions.
                </>
              }
              copy="Delivery, returns, care and custom sizes — the things most enquiries are about. If yours is not here, the form above reaches a person."
            />
          </Reveal>

          <div className="mt-10 grid gap-3 lg:grid-cols-2">
            {FAQS.map((faq, index) => (
              <Reveal key={faq.id} delay={index * 60}>
                <details
                  id={faq.id}
                  className="group scroll-mt-28 rounded-2xl border border-sand-200 bg-[#f7f3ec] px-5 py-4 transition-colors open:border-clay-300 open:bg-white sm:px-6"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-walnut-950 [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <Plus
                      className="size-4 shrink-0 text-clay-700 transition-transform duration-300 group-open:rotate-45"
                      aria-hidden
                    />
                  </summary>
                  <p className="mt-3 max-w-prose text-xs leading-relaxed text-walnut-950/60 sm:text-[0.8rem]">
                    {faq.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- showroom */}
      <section className="relative overflow-hidden bg-walnut-950 py-20 text-white sm:py-24">
        <div
          className="pointer-events-none absolute -left-32 -top-32 size-[28rem] rounded-full bg-clay-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-[1400px] gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-10">
          <Reveal>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-clay-200">
              Visit the studio
            </p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.03em]">
              Come sit in
              <br />
              <span className="italic text-clay-200">the pieces.</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/60">
              Photographs only get you so far. The showroom holds the full sample library, a
              rotating edit of the collection, and the repair bench where every finish is tested.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="mailto:hello@lumerahome.com?subject=Showroom%20visit"
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-6 text-sm font-semibold text-walnut-950 transition-colors duration-300 hover:bg-clay-100"
              >
                Book a visit
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <Link
                href="/products"
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-sm font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
              >
                Browse the collection
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <dl className="rounded-[1.6rem] border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm sm:p-8">
              <div className="flex gap-4 border-b border-white/10 pb-5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-clay-200" aria-hidden />
                <div>
                  <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                    Address
                  </dt>
                  <dd className="mt-1 text-sm text-white/80">
                    112 Katipunan Avenue
                    <br />
                    Quezon City, Metro Manila
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 border-b border-white/10 py-5">
                <Clock className="mt-0.5 size-4 shrink-0 text-clay-200" aria-hidden />
                <div>
                  <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                    Opening hours
                  </dt>
                  <dd className="mt-1 text-sm text-white/80">
                    Monday–Saturday, 10am–7pm
                    <br />
                    Sunday by appointment
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 pt-5">
                <Phone className="mt-0.5 size-4 shrink-0 text-clay-200" aria-hidden />
                <div>
                  <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                    Showroom line
                  </dt>
                  <dd className="mt-1 text-sm text-white/80">
                    <a href="tel:+63285550142" className="hover:text-white">
                      +63 2 8555 0142
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>
    </StoreShell>
  );
}
