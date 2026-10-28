import type { NextConfig } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL ?? 'http://localhost:4000';

/** Turn the configured uploads origin into an `images.remotePatterns` entry. */
function uploadsPattern(): { protocol: 'http' | 'https'; hostname: string; port?: string } | null {
  try {
    const url = new URL(UPLOADS_URL);
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port || undefined,
    };
  } catch {
    return null;
  }
}

const pattern = uploadsPattern();

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // The catalogue images are generated SVG placeholders served by Express.
  // `unoptimized` keeps Next from trying to rasterise them, which it refuses
  // to do for SVG by default.
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    remotePatterns: pattern
      ? [
          { ...pattern, pathname: '/uploads/**' },
          { protocol: 'https', hostname: 'images.unsplash.com' },
          { protocol: 'https', hostname: 'picsum.photos' },
        ]
      : [],
  },

  async rewrites() {
    // Convenience proxy so the browser can talk to `/api/*` on the app origin.
    // The typed fetch client uses NEXT_PUBLIC_API_URL directly; this exists so
    // curl-ing the frontend origin also works during development.
    return [{ source: '/api/:path*', destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
