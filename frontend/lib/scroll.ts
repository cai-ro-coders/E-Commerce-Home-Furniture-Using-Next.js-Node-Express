/**
 * Scroll to the fragment in the current URL, respecting each section's
 * `scroll-mt-*` class so the fixed storefront header never covers the target.
 * Returns `false` when the target has not mounted yet.
 */
export function scrollToHash(
  hash: string = window.location.hash,
  behavior: ScrollBehavior = 'smooth'
): boolean {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (!id) return false;
  const target = document.getElementById(id);
  if (!target) return false;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : behavior });
  return true;
}
