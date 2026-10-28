'use client';

/**
 * Sticky storefront header.
 *
 * On the home page it floats transparently over the hero and turns into a
 * frosted solid bar after the first scroll. The overlays it controls (search,
 * cart drawer, mobile menu, mega menu) are rendered as siblings rather than
 * children, because a `backdrop-filter` on the header would otherwise become
 * the containing block for their fixed positioning.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRight,
  ChevronDown,
  Heart,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useStore } from '@/components/providers/StoreProvider';
import { useStoreUI } from '@/components/providers/StoreUIProvider';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { MegaMenu } from '@/components/storefront/MegaMenu';
import { SearchOverlay } from '@/components/storefront/SearchOverlay';
import { categoryIcon } from '@/components/storefront/categoryIcons';
import { Avatar } from '@/components/ui/Avatar';
import { useClickOutside } from '@/hooks/useClickOutside';
import { imageUrl } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';
import { toastSuccess } from '@/lib/alerts';
import { BRAND } from '@/lib/nav';
import type { Category } from '@/types';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Collections', href: '/products' },
  { label: 'Brand', href: '/brands' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function StoreHeader({
  categories,
  tree,
}: {
  categories: Category[];
  tree: Category[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, cartCount, logout } = useAuth();
  const { wishlist } = useStore();
  const { openCart, openSearch } = useStoreUI();

  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaTimer = useRef<number | null>(null);

  const megaRef = useClickOutside<HTMLDivElement>(() => setMegaOpen(false), megaOpen);
  const accountRef = useClickOutside<HTMLDivElement>(() => setAccountOpen(false), accountOpen);

  const isHome = pathname === '/';
  const onHero = isHome && !scrolled;
  const roots = tree.filter((category) => !category.parent_id && category.status === 'active');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMegaOpen(false);
    setAccountOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMegaOpen(false);
      setAccountOpen(false);
      setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(
    () => () => {
      if (megaTimer.current) window.clearTimeout(megaTimer.current);
    },
    []
  );

  const openMega = () => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    setMegaOpen(true);
  };

  const scheduleMegaClose = () => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    megaTimer.current = window.setTimeout(() => setMegaOpen(false), 140);
  };

  const closeAll = () => {
    setMegaOpen(false);
    setAccountOpen(false);
    setMobileOpen(false);
  };

  const signOut = async () => {
    setAccountOpen(false);
    await logout();
    toastSuccess('Signed out');
    router.push('/');
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : !href.includes('#') && pathname.startsWith(href);

  const firstName = user?.full_name?.split(' ')[0] ?? '';

  return (
    <>
      <header
        className={cn(
          'z-50 w-full transition-[background-color,border-color,box-shadow] duration-500',
          isHome ? 'fixed inset-x-0 top-0' : 'sticky top-0',
          onHero
            ? 'bg-transparent'
            : 'border-b border-sand-200/80 bg-sand-50/95 shadow-[0_8px_30px_-24px_rgba(22,19,15,0.45)] backdrop-blur-xl'
        )}
      >
        {/* ------------------------------------------------- announcement */}
        <div className="bg-walnut-950 text-white/70">
          <div className="mx-auto flex h-9 max-w-[1500px] items-center justify-between gap-4 px-4 text-[0.58rem] font-medium uppercase tracking-[0.22em] sm:px-6 lg:px-10">
            <span className="hidden sm:inline">Complimentary delivery over ₱25,000</span>
            <span className="truncate text-white/85">Handmade in the Philippines · Since 2014</span>
            <span className="hidden md:inline">30-day returns</span>
          </div>
        </div>

        {/* ----------------------------------------------------- main bar */}
        <div
          className={cn(
            'border-b transition-colors duration-500',
            onHero ? 'border-white/15' : 'border-transparent'
          )}
        >
          <div className="mx-auto flex h-[4.6rem] w-full max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:h-[5rem] lg:px-10">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors lg:hidden',
                onHero
                  ? 'border-white/25 text-white hover:bg-white/10'
                  : 'border-sand-200 text-walnut-900 hover:bg-sand-100'
              )}
            >
              <Menu className="size-4.5" />
            </button>

            <Link
              href="/"
              aria-label={`${BRAND.name} — home`}
              className="mr-3 flex shrink-0 flex-col leading-none sm:mr-6"
            >
              <span
                className={cn(
                  'font-display text-[1.3rem] font-medium uppercase tracking-[0.24em] transition-colors sm:text-[1.45rem]',
                  onHero ? 'text-white' : 'text-walnut-950'
                )}
              >
                Lumera
              </span>
              <span
                className={cn(
                  'mt-1 pl-[0.14em] text-[0.48rem] font-semibold uppercase tracking-[0.62em] transition-colors',
                  onHero ? 'text-white/55' : 'text-sand-500'
                )}
              >
                Home
              </span>
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
              <HeaderNavLink
                href={NAV[0].href}
                label={NAV[0].label}
                onHero={onHero}
                active={isActive(NAV[0].href)}
              />

              <div
                ref={megaRef}
                onMouseEnter={openMega}
                onMouseLeave={scheduleMegaClose}
              >
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={megaOpen}
                  onClick={() => setMegaOpen((value) => !value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-[0.78rem] font-medium transition-colors',
                    onHero
                      ? 'text-white/75 hover:text-white'
                      : 'text-sand-600 hover:text-walnut-950',
                    megaOpen && (onHero ? 'text-white' : 'text-walnut-950')
                  )}
                >
                  <LayoutGrid className="size-3.5" />
                  All categories
                  <ChevronDown
                    className={cn('size-3.5 transition-transform duration-300', megaOpen && 'rotate-180')}
                  />
                </button>

                <div
                  className={cn(
                    'absolute left-1/2 top-[calc(100%-1.25rem)] z-50 w-[min(80rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden border border-sand-200 bg-sand-50 text-walnut-950 shadow-[0_40px_90px_-40px_rgba(22,19,15,0.5)] transition-all duration-300 ease-out',
                    megaOpen
                      ? 'visible translate-y-0 opacity-100'
                      : 'invisible -translate-y-3 opacity-0'
                  )}
                >
                  <MegaMenu tree={tree} onNavigate={closeAll} />
                </div>
              </div>

              {NAV.slice(1).map((item) => (
                <HeaderNavLink
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  onHero={onHero}
                  active={isActive(item.href)}
                />
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                aria-label="Search"
                onClick={openSearch}
                className={cn(
                  'flex size-9 items-center justify-center rounded-full border transition-colors sm:size-10',
                  onHero
                    ? 'border-white/25 text-white hover:bg-white/10'
                    : 'border-sand-200 text-walnut-900 hover:bg-sand-100'
                )}
              >
                <Search className="size-4.5" />
              </button>

              {/* ------------------------------------------- wishlist peek */}
              <div className="group relative hidden sm:block">
                <Link
                  href="/wishlist"
                  aria-label={`Wishlist, ${wishlist.length} saved`}
                  className={cn(
                    'relative flex size-9 items-center justify-center rounded-full border transition-colors sm:size-10',
                    onHero
                      ? 'border-white/25 text-white hover:bg-white/10'
                      : 'border-sand-200 text-walnut-900 hover:bg-sand-100'
                  )}
                >
                  <Heart className="size-4.5" />
                  {wishlist.length > 0 ? (
                    <span className="absolute -right-1 -top-1 flex size-4.5 items-center justify-center rounded-full bg-clay-600 text-[0.55rem] font-bold text-white">
                      {wishlist.length}
                    </span>
                  ) : null}
                </Link>

                <div className="pointer-events-none invisible absolute right-0 top-full z-50 w-[21rem] translate-y-2 pt-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="overflow-hidden rounded-2xl border border-sand-200 bg-sand-50 text-walnut-950 shadow-[0_30px_70px_-30px_rgba(22,19,15,0.45)]">
                    <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-clay-700">
                        Saved pieces
                      </p>
                      <span className="text-xs text-sand-500">{wishlist.length}</span>
                    </div>

                    {wishlist.length === 0 ? (
                      <div className="px-4 py-5">
                        <p className="text-sm font-medium text-walnut-950">Nothing saved yet.</p>
                        <p className="mt-1 text-xs leading-relaxed text-sand-500">
                          Tap the heart on any piece to keep it here for later.
                        </p>
                        <Link
                          href="/products"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-clay-700 hover:text-clay-800"
                        >
                          Find something to love
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    ) : (
                      <ul className="divide-y divide-sand-100">
                        {wishlist.slice(0, 3).map((item) => (
                          <li key={item.id}>
                            <Link
                              href={`/products/${item.slug}`}
                              className="group/item flex items-center gap-3 px-4 py-3 transition-colors hover:bg-sand-50"
                            >
                              <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                                {item.primary_image ? (
                                  <img
                                    src={imageUrl(item.primary_image)}
                                    alt=""
                                    className="size-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                                  />
                                ) : null}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-medium text-walnut-950">
                                  {item.name}
                                </span>
                                <span className="mt-0.5 block text-[0.68rem] font-semibold tabular-nums text-clay-700">
                                  {formatMoney(
                                    item.on_sale && item.sale_price ? item.sale_price : item.price,
                                    'PHP',
                                    { decimals: 0 }
                                  )}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link
                      href="/wishlist"
                      className="flex items-center justify-between border-t border-sand-200 px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-walnut-950 transition-colors hover:bg-sand-50 hover:text-clay-700"
                    >
                      View all saved pieces
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------ account */}
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  aria-label="Account menu"
                  aria-haspopup="true"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((value) => !value)}
                  className={cn(
                    'flex h-9 items-center gap-2 rounded-full border pl-1 pr-1 transition-colors sm:h-10 sm:pr-2',
                    onHero
                      ? 'border-white/25 text-white hover:bg-white/10'
                      : 'border-sand-200 text-walnut-900 hover:bg-sand-100'
                  )}
                >
                  {user ? (
                    <Avatar src={user.avatar} name={user.full_name} size="sm" />
                  ) : (
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/10 sm:size-8">
                      <UserRound className="size-4" />
                    </span>
                  )}
                  <span className="hidden text-left leading-tight xl:block">
                    <span
                      className={cn(
                        'block text-[0.47rem] font-semibold uppercase tracking-[0.2em]',
                        onHero ? 'text-white/55' : 'text-sand-500'
                      )}
                    >
                      {user ? 'Welcome' : 'Account'}
                    </span>
                    <span className="block max-w-24 truncate text-[0.7rem] font-semibold">
                      {user ? firstName : 'Sign in'}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'hidden size-3.5 transition-transform duration-300 xl:block',
                      accountOpen && 'rotate-180'
                    )}
                  />
                </button>

                <div
                  className={cn(
                    'absolute right-0 top-full z-50 w-[19rem] pt-3 transition-all duration-300',
                    accountOpen
                      ? 'visible translate-y-0 opacity-100'
                      : 'invisible -translate-y-2 opacity-0'
                  )}
                >
                  <div className="overflow-hidden rounded-2xl border border-sand-200 bg-sand-50 text-walnut-950 shadow-[0_30px_70px_-30px_rgba(22,19,15,0.45)]">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 border-b border-sand-200 px-4 py-4">
                          <Avatar src={user.avatar} name={user.full_name} size="md" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-walnut-950">
                              {user.full_name}
                            </p>
                            <p className="truncate text-[0.7rem] text-sand-500">{user.email}</p>
                          </div>
                        </div>
                        <nav className="p-2">
                          <AccountLink href="/account" icon={UserRound} label="Account dashboard" onClick={closeAll} />
                          <AccountLink href="/account?tab=orders" icon={Package} label="My orders" onClick={closeAll} />
                          <AccountLink href="/wishlist" icon={Heart} label="Saved pieces" onClick={closeAll} />
                          <button
                            type="button"
                            onClick={() => void signOut()}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                          >
                            <LogOut className="size-3.5" />
                            Sign out
                          </button>
                        </nav>
                      </>
                    ) : (
                      <>
                        <div className="border-b border-sand-200 px-4 py-4">
                          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-clay-700">
                            Welcome to Lumera
                          </p>
                          <p className="mt-1 font-display text-lg leading-tight text-walnut-950">
                            Keep your favourites close.
                          </p>
                          <p className="mt-1 text-[0.7rem] leading-relaxed text-sand-500">
                            Sign in to save pieces, track orders and pick up where you left off.
                          </p>
                        </div>
                        <div className="space-y-2 p-3">
                          <Link
                            href="/login"
                            onClick={closeAll}
                            className="flex h-10 items-center justify-center rounded-full bg-walnut-950 text-xs font-semibold text-white transition-colors hover:bg-clay-700"
                          >
                            Sign in
                          </Link>
                          <Link
                            href="/register"
                            onClick={closeAll}
                            className="flex h-10 items-center justify-center rounded-full border border-sand-300 text-xs font-semibold text-walnut-950 transition-colors hover:border-walnut-900"
                          >
                            Create an account
                          </Link>
                          <Link
                            href="/wishlist"
                            onClick={closeAll}
                            className="flex items-center justify-center gap-1.5 pt-1 text-[0.7rem] font-medium text-sand-500 transition-colors hover:text-clay-700"
                          >
                            <Heart className="size-3.5" />
                            Your wishlist
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
                onClick={openCart}
                className={cn(
                  'relative flex size-9 items-center justify-center rounded-full border transition-colors sm:size-10',
                  onHero
                    ? 'border-white/25 text-white hover:bg-white/10'
                    : 'border-sand-200 text-walnut-900 hover:bg-sand-100'
                )}
              >
                <ShoppingBag className="size-4.5" />
                {cartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex size-4.5 items-center justify-center rounded-full bg-clay-600 text-[0.55rem] font-bold text-white">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------- mobile drawer */}
      <div className={cn('fixed inset-0 z-[65] lg:hidden', mobileOpen ? 'visible' : 'invisible')} aria-hidden={!mobileOpen}>
        <div
          className={cn(
            'absolute inset-0 bg-walnut-950/50 backdrop-blur-[2px] transition-opacity duration-400',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            'absolute inset-y-0 left-0 flex w-[88vw] max-w-sm flex-col bg-sand-50 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
            <Link href="/" onClick={closeAll} className="flex flex-col leading-none">
              <span className="font-display text-lg font-medium uppercase tracking-[0.24em] text-walnut-950">
                Lumera
              </span>
              <span className="mt-1 text-[0.45rem] font-semibold uppercase tracking-[0.58em] text-sand-500">
                Home
              </span>
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="flex size-9 items-center justify-center rounded-full border border-sand-200 text-sand-600"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openSearch();
              }}
              className="mb-5 flex w-full items-center gap-2.5 rounded-full border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-sand-500"
            >
              <Search className="size-4" />
              What are you looking for?
            </button>

            <Link
              href="/wishlist"
              onClick={closeAll}
              className="mb-5 flex items-center justify-between rounded-full border border-sand-200 px-4 py-3 text-xs font-semibold text-walnut-950 transition-colors hover:border-clay-300 hover:bg-clay-50"
            >
              <span className="flex items-center gap-2">
                <Heart className="size-3.5 text-clay-700" />
                Saved pieces
              </span>
              <span className="flex size-5 items-center justify-center rounded-full bg-sand-100 text-[0.6rem] text-sand-600">
                {wishlist.length}
              </span>
            </Link>

            <nav className="flex flex-col" aria-label="Mobile primary">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeAll}
                  className="border-b border-sand-100 py-3.5 font-display text-xl text-walnut-950 transition-colors hover:text-clay-700"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-7">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-sand-500">
                Shop by category
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {roots.slice(0, 8).map((category) => {
                  const Icon = categoryIcon(category.slug);
                  return (
                    <Link
                      key={category.id}
                      href={`/products/${category.slug}`}
                      onClick={closeAll}
                      className="group flex items-center gap-2 rounded-xl border border-sand-200 px-3 py-2.5 text-xs font-medium text-sand-700 transition-colors hover:border-clay-300 hover:bg-clay-50"
                    >
                      <Icon className="size-4 shrink-0 text-clay-700" />
                      <span className="truncate">{category.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-sand-100 p-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar} name={user.full_name} size="md" />
                    <div className="min-w-0">
                      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-sand-500">
                        Welcome back
                      </p>
                      <p className="truncate text-sm font-semibold text-walnut-950">{user.full_name}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href="/account"
                      onClick={closeAll}
                      className="rounded-lg bg-white px-3 py-2 text-center text-xs font-medium text-walnut-950"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={closeAll}
                      className="rounded-lg bg-white px-3 py-2 text-center text-xs font-medium text-walnut-950"
                    >
                      Wishlist ({wishlist.length})
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-walnut-950">Keep your favourites close.</p>
                  <p className="mt-1 text-[0.7rem] leading-relaxed text-sand-500">
                    Sign in to save pieces and track orders.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href="/login"
                      onClick={closeAll}
                      className="flex h-9 flex-1 items-center justify-center rounded-full bg-walnut-950 text-xs font-semibold text-white"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeAll}
                      className="flex h-9 flex-1 items-center justify-center rounded-full border border-sand-300 text-xs font-semibold text-walnut-950"
                    >
                      Register
                    </Link>
                  </div>
                </>
              )}
            </div>

            <p className="mt-6 text-center text-[0.62rem] uppercase tracking-[0.18em] text-sand-400">
              Manila · Since 2014
            </p>
          </div>
        </div>
      </div>

      <SearchOverlay categories={categories} />
      <CartDrawer />
    </>
  );
}

function HeaderNavLink({
  href,
  label,
  onHero,
  active,
}: {
  href: string;
  label: string;
  onHero: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative px-3 py-2 text-[0.78rem] font-medium tracking-[0.02em] transition-colors',
        onHero ? 'text-white/75 hover:text-white' : 'text-sand-600 hover:text-walnut-950',
        active && (onHero ? 'text-white' : 'text-walnut-950')
      )}
    >
      {label}
      <span
        className={cn(
          'absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100',
          onHero ? 'bg-white' : 'bg-clay-600'
        )}
      />
    </Link>
  );
}

function AccountLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof UserRound;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-sand-700 transition-colors hover:bg-sand-100 hover:text-walnut-950"
    >
      <Icon className="size-3.5" />
      {label}
    </Link>
  );
}
