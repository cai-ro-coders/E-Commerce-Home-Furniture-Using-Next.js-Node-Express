'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react';
import { Reveal } from '@/components/storefront/Reveal';
import { cn } from '@/lib/cn';

const TESTIMONIALS = [
  {
    quote:
      'The sofa arrived on a Tuesday and by Friday it had already become the centre of the house. It is the first piece of furniture we have bought that feels like it will outlast us.',
    name: 'Camille Reyes',
    detail: 'Bergen 3-Seater · Makati',
    initials: 'CR',
  },
  {
    quote:
      'What sold us was the honesty of the materials. No veneer, no surprises. Two years in, the oak has a patina that is better than the day it came through the door.',
    name: 'Miguel Santos',
    detail: 'Ashford Queen Bed · Cebu',
    initials: 'MS',
  },
  {
    quote:
      'We worked with the studio on a full dining room. They listened to how we actually eat, then drew something quieter and better than anything we had pinned.',
    name: 'Patricia & Ben Lim',
    detail: 'Galleon Dining Table · Alabang',
    initials: 'PL',
  },
  {
    quote:
      'The delivery crew assembled everything, took the packaging away and left the room looking like the photographs. It felt less like a purchase and more like a handover.',
    name: 'Andrea Villanueva',
    detail: 'Cove Sectional · Quezon City',
    initials: 'AV',
  },
];

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReduced = useRef(false);

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (paused || prefersReduced.current) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % TESTIMONIALS.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, index]);

  const go = (direction: number) => {
    setIndex((value) => (value + direction + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section id="reviews" className="scroll-mt-32 overflow-hidden bg-sand-50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
        <Reveal className="text-center">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-clay-700">
            Kind words
          </p>
          <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.02] tracking-[-0.03em] text-walnut-950">
            Loved in <span className="italic text-clay-700">4,000 homes.</span>
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="flex items-center gap-0.5" aria-hidden>
              {Array.from({ length: 5 }, (_, star) => (
                <Star key={star} className="size-3.5 fill-amber-400 text-amber-400" />
              ))}
            </span>
            <span className="text-xs text-sand-500">4.9 average from 1,200 verified reviews</span>
          </div>
        </Reveal>

        <Reveal delay={100} className="mt-12">
          <div
            className="relative rounded-[1.6rem] border border-sand-200 bg-[#f7f3ec] px-5 py-10 sm:px-12 sm:py-12"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <Quote className="mx-auto size-7 fill-clay-200/70 text-clay-200" aria-hidden />

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {TESTIMONIALS.map((testimonial) => (
                  <figure
                    key={testimonial.name}
                    className="w-full shrink-0 px-1 text-center"
                    aria-hidden={TESTIMONIALS[index].name !== testimonial.name}
                  >
                    <blockquote className="mx-auto mt-6 min-h-[11rem] max-w-3xl font-display text-xl leading-[1.35] text-walnut-950 sm:min-h-[9rem] sm:text-[1.65rem]">
                      “{testimonial.quote}”
                    </blockquote>
                    <figcaption className="mt-6 flex flex-col items-center gap-2">
                      <span className="flex size-11 items-center justify-center rounded-full bg-clay-100 text-xs font-semibold text-clay-700">
                        {testimonial.initials}
                      </span>
                      <span className="text-sm font-semibold text-walnut-950">{testimonial.name}</span>
                      <span className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-sand-400">
                        {testimonial.detail}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-5">
              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={() => go(-1)}
                className="flex size-9 items-center justify-center rounded-full border border-sand-300 text-sand-500 transition-colors hover:border-walnut-950 hover:text-walnut-950"
              >
                <ArrowLeft className="size-3.5" />
              </button>

              <div className="flex items-center gap-1.5" role="tablist" aria-label="Testimonials">
                {TESTIMONIALS.map((testimonial, dot) => (
                  <button
                    key={testimonial.name}
                    type="button"
                    role="tab"
                    aria-selected={dot === index}
                    aria-label={`Show testimonial from ${testimonial.name}`}
                    onClick={() => setIndex(dot)}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      dot === index ? 'w-6 bg-clay-700' : 'w-1.5 bg-sand-300 hover:bg-sand-400'
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label="Next testimonial"
                onClick={() => go(1)}
                className="flex size-9 items-center justify-center rounded-full border border-sand-300 text-sand-500 transition-colors hover:border-walnut-950 hover:text-walnut-950"
              >
                <ArrowRight className="size-3.5" />
              </button>
            </div>

            <p className="mt-5 text-center text-[0.55rem] font-medium uppercase tracking-[0.22em] text-sand-400">
              {paused ? 'Paused' : 'Auto-advancing'} · {String(index + 1).padStart(2, '0')} /{' '}
              {String(TESTIMONIALS.length).padStart(2, '0')}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
