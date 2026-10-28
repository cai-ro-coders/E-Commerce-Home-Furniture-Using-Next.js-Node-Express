# Lumera Home — Frontend

Next.js 16 storefront and admin console for the Lumera Home furniture e-commerce platform.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront or [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin console.

> **Note:** The dev script uses `--webpack` because Turbopack native bindings are not available under Rosetta 2 on Apple Silicon.

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_UPLOADS_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (webpack) |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |

## Structure

```
app/               # Routes — storefront (/, /products, /cart, …) and admin (/admin/…)
components/
  ui/              # Reusable UI primitives (Button, Card, Modal, …)
  storefront/      # StoreHeader, StoreFooter, ProductCard, StoreShell
  admin/           # AdminShell, AdminSidebar, DataTable, Charts, DashboardPanels, …
  providers/       # AuthProvider, ThemeProvider, AppProviders
hooks/             # useDebounce, useClickOutside, useMediaQuery
lib/               # api client, alerts (SweetAlert2), formatters, utilities
types/             # Shared TypeScript types
public/            # Static assets
```

## Sign In

| Role     | Email                      | Password      |
|----------|----------------------------|---------------|
| Admin    | admin@lumerahome.com       | Admin@123     |
| Staff    | staff@lumerahome.com       | Staff@123     |
| Customer | maria.reyes@example.com    | Customer@123  |
