import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: {
    default: 'Lumera Home — Considered Furniture',
    template: '%s · Lumera Home',
  },
  description:
    'Lumera Home is a furniture studio and store: sofas, dining, bedroom and workspace pieces, built to last and delivered to your door.',
  applicationName: 'Lumera Home',
  keywords: [
    'furniture',
    'home furniture',
    'sofa',
    'dining table',
    'bedroom',
    'workspace',
    'interior',
  ],
  authors: [{ name: 'Lumera Home' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#16130f' },
  ],
};

/**
 * Applies the stored theme before first paint.
 *
 * This has to be a blocking inline script in `<head>`: doing it in a React
 * effect would paint the light theme first and then flip, which is the flash
 * this exists to prevent. It is intentionally tiny and dependency-free.
 */
const THEME_SCRIPT =
  "(function(){try{" +
  "var stored = localStorage.getItem('lumera.theme') || 'system';" +
  "var dark = stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);" +
  "document.documentElement.classList.toggle('dark', dark);" +
  "document.documentElement.style.colorScheme = dark ? 'dark' : 'light';" +
  "}catch(e){}})();";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
