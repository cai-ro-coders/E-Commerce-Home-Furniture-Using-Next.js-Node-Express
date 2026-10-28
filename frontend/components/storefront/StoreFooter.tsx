'use client';

/**
 * Large storefront footer.
 *
 * The newsletter form is intentionally local: it acknowledges the address and
 * leaves delivery to the email platform, rather than pretending to subscribe.
 */
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { BRAND } from '@/lib/nav';
import type { Category } from '@/types';

export function StoreFooter({ categories }: { categories: Category[] }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const subscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail('');
  };

  return (
    <footer id="contact" className="mt-auto scroll-mt-28 bg-[#ede7dc] text-walnut-950">
      {/* ----------------------------------------------------- newsletter */}
      <div className="border-b border-walnut-950/10">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:items-end lg:gap-16 lg:px-10 lg:py-16">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-clay-700">
              The slower letter
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl leading-[1.08] tracking-[-0.02em] sm:text-4xl lg:text-[2.9rem]">
              New pieces, quiet stories, and rooms worth living in.
            </h2>
          </div>

          <div>
            <p className="max-w-md text-sm leading-relaxed text-walnut-950/60">
              One considered note a month. No flash sales, no noise — just the pieces and people
              behind them.
            </p>
            {done ? (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-3 text-sm font-medium text-emerald-800">
                You are on the list. Look out for the next letter.
              </p>
            ) : (
              <form onSubmit={subscribe} className="mt-5 flex items-center gap-0 border-b border-walnut-950/40 pb-2">
                <Mail className="mr-3 size-4 shrink-0 text-walnut-950/45" aria-hidden />
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your email address"
                  className="min-w-0 flex-1 bg-transparent text-sm text-walnut-950 placeholder:text-walnut-950/40 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to the newsletter"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-walnut-950 text-white transition-colors hover:bg-clay-700"
                >
                  <ArrowRight className="size-4" />
                </button>
              </form>
            )}
            <p className="mt-3 text-[0.65rem] text-walnut-950/45">
              By subscribing you agree to our privacy policy. Unsubscribe any time.
            </p>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- columns */}
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-8 lg:px-10">
        <div>
          <Link href="/" className="inline-flex flex-col leading-none">
            <span className="font-display text-2xl font-medium uppercase tracking-[0.24em]">
              Lumera
            </span>
            <span className="mt-1.5 text-[0.48rem] font-semibold uppercase tracking-[0.62em] text-walnut-950/50">
              Home
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-walnut-950/60">
            {BRAND.tagline}. Furniture made from solid materials, by people we know, for rooms
            that are actually lived in.
          </p>
          <div className="mt-5 flex gap-2">
            <SocialLink label="Instagram" href="https://www.instagram.com">
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
            </SocialLink>
            <SocialLink label="Facebook" href="https://www.facebook.com">
              <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.87.24-1.46 1.49-1.46H17V5.02A20 20 0 0 0 14.77 5C12.47 5 10.9 6.4 10.9 9v2H8.2v3h2.7v8h2.6Z" />
            </SocialLink>
            <SocialLink label="Pinterest" href="https://www.pinterest.com">
              <path d="M12 2a10 10 0 0 0-3.64 19.32c-.05-.79-.09-2 .2-2.86l1.17-4.98s-.3-.6-.3-1.48c0-1.39.8-2.43 1.81-2.43.85 0 1.27.64 1.27 1.41 0 .86-.55 2.14-.83 3.33-.24 1 .5 1.81 1.48 1.81 1.77 0 3.13-1.87 3.13-4.57 0-2.39-1.72-4.06-4.17-4.06-2.84 0-4.51 2.13-4.51 4.33 0 .86.33 1.78.74 2.28.08.1.09.19.07.29l-.28 1.13c-.04.18-.14.22-.33.13-1.24-.58-2.02-2.39-2.02-3.85 0-3.13 2.27-6 6.56-6 3.44 0 6.11 2.45 6.11 5.73 0 3.42-2.16 6.17-5.15 6.17-1.01 0-1.95-.52-2.28-1.14l-.62 2.36c-.22.87-.83 1.96-1.24 2.62A10 10 0 1 0 12 2Z" />
            </SocialLink>
            <SocialLink label="Journal" href="/#story">
              <path d="M5 3h11a3 3 0 0 1 3 3v15H8a3 3 0 0 1-3-3V3Zm2 2v13a1 1 0 0 0 1 1h9V6a1 1 0 0 0-1-1H7Zm2 3h6v1.6H9V8Zm0 3.4h6v1.6H9v-1.6Zm0 3.4h4v1.6H9v-1.6Z" />
            </SocialLink>
          </div>
        </div>

        <FooterColumn title="Shop">
          <FooterLink href="/products">All furniture</FooterLink>
          {categories
            .filter((category) => !category.parent_id)
            .slice(0, 5)
            .map((category) => (
              <FooterLink key={category.id} href={`/products/${category.slug}`}>
                {category.name}
              </FooterLink>
            ))}
          <FooterLink href="/products?on_sale=true">The sale</FooterLink>
        </FooterColumn>

        <FooterColumn title="The studio">
          <FooterLink href="/about">Our story</FooterLink>
          <FooterLink href="/about#materials">Materials & making</FooterLink>
          <FooterLink href="/brands">The makers</FooterLink>
          <FooterLink href="/#reviews">Customer stories</FooterLink>
          <FooterLink href="/about#visit">Visit the showroom</FooterLink>
        </FooterColumn>

        <FooterColumn title="Care">
          <FooterLink href="/contact#delivery">Delivery & assembly</FooterLink>
          <FooterLink href="/contact#returns">Returns & exchanges</FooterLink>
          <FooterLink href="/contact#care">Furniture care</FooterLink>
          <FooterLink href="/contact#trade">Trade programme</FooterLink>
          <FooterLink href="/login">Sign in</FooterLink>
        </FooterColumn>
      </div>

      {/* ---------------------------------------------------------- contact */}
      <div className="border-t border-walnut-950/10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-6 text-xs text-walnut-950/55 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              112 Katipunan Avenue, Quezon City
            </span>
            <a href="tel:+63285550142" className="inline-flex items-center gap-1.5 hover:text-clay-700">
              <Phone className="size-3.5" />
              +63 2 8555 0142
            </a>
            <a href="mailto:hello@lumerahome.com" className="inline-flex items-center gap-1.5 hover:text-clay-700">
              <Mail className="size-3.5" />
              hello@lumerahome.com
            </a>
          </div>
          <p className="text-[0.65rem] uppercase tracking-[0.16em] text-walnut-950/40">
            Mon–Sat, 10am–7pm · Sunday by appointment
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------- watermark */}
      <div className="relative overflow-hidden border-t border-walnut-950/10">
        <p
          aria-hidden
          className="pointer-events-none select-none whitespace-nowrap px-5 pt-6 font-display text-[20vw] font-medium leading-[0.72] tracking-[-0.045em] text-walnut-950/[0.055]"
        >
          Lumera
        </p>
        <div className="relative mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-5 pb-6 text-[0.65rem] text-walnut-950/45 sm:flex-row sm:px-8 lg:px-10">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="#" className="hover:text-clay-700">Privacy</Link>
            <Link href="#" className="hover:text-clay-700">Terms</Link>
            <Link href="#" className="hover:text-clay-700">Accessibility</Link>
            <span className="hidden h-3 w-px bg-walnut-950/20 sm:block" />
            <span className="uppercase tracking-[0.16em]">Visa · Mastercard · GCash · Bank transfer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-walnut-950/45">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5 text-sm">{children}</ul>
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 text-walnut-950/65 transition-colors hover:text-clay-700"
      >
        {children}
        <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
    </li>
  );
}

function SocialLink({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer noopener' : undefined}
      className="flex size-9 items-center justify-center rounded-full border border-walnut-950/15 text-walnut-950/65 transition-colors hover:border-walnut-950 hover:bg-walnut-950 hover:text-white"
    >
      <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden>
        {children}
      </svg>
    </a>
  );
}
