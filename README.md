# Lumera Home — E-Commerce Platform

A full-stack e-commerce application for a home furniture store, built with Next.js, Express.js, and MySQL.

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | Next.js 16, React 19, Tailwind CSS v4, TypeScript |
| Backend   | Express.js, TypeScript, Node.js |
| Database  | MySQL (via mysql2 prepared statements) |
| Auth      | JWT (access + refresh cookies), bcrypt, CSRF protection |
| Charts    | Chart.js (react-chartjs-2) |
| Calendar  | FullCalendar |
| Tables    | DataTables (server-side processing) |
| Alerts    | SweetAlert2 |

## Prerequisites

- **Node.js** — v20 or later
- **npm** — v10 or later
- **MySQL** — v8 or later (MAMP on port 8889 works too)

## Project Structure

```
eccommerce/
├── frontend/              # Next.js frontend (storefront + admin console)
│   ├── app/               # Routes (products, cart, checkout, admin/…)
│   ├── components/        # UI, storefront, admin components
│   ├── lib/               # API client, utilities, alerts
│   ├── hooks/             # Custom React hooks
│   ├── types/             # Shared TypeScript types
│   └── public/            # Static assets
├── backend/               # Express.js REST API
│   └── src/
│       ├── config/        # Env, database pool
│       ├── controllers/   # Request handlers
│       ├── middleware/    # Auth, CSRF, RBAC, validation, uploads
│       ├── models/        # Data access layer
│       ├── routes/        # API route definitions
│       ├── services/      # Business logic
│       ├── validators/    # Zod schemas
│       ├── utils/         # Helpers (JWT, password, CSV, pagination)
│       └── types/         # Shared TypeScript types
├── database/
│   └── migrations/        # SQL schema files
└── README.md
```

## Installation

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Configure environment variables

#### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=4000
API_PREFIX=/api
API_URL=http://localhost:4000

DB_HOST=127.0.0.1
DB_PORT=8889
DB_USER=root
DB_PASSWORD=root
DB_NAME=ecommerce_nextjsDB
DB_CONNECTION_LIMIT=10

JWT_SECRET=change_me_to_a_long_random_string
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

CSRF_PROTECTION=true
XSS_SANITIZE=true
CORS_ORIGINS=http://localhost:3000

UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=8

SITE_NAME=Lumera Home
CURRENCY=PHP
TAX_RATE=0.12
SHIPPING_FEE=250
```

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_UPLOADS_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Set up the database

```bash
cd backend
npm run db:migrate   # Create tables, indexes, foreign keys
npm run db:seed      # Insert realistic demo data (53 products, 68 orders, …)
```

### 5. Configure Stripe (payments)

The official Stripe Node SDK is installed in `backend/`. For local API calls, install the Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe
# other platforms
npm install -g @stripe/cli@latest

stripe login
stripe products list   # confirms the CLI is connected
```

Then add your test keys to `backend/.env` (Dashboard → Developers → API keys):

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # printed by `stripe listen`
```

The same keys can be managed at runtime under **Admin → Settings → Payment gateways**. Environment values take precedence over the settings table.

### 6. Configure PayPal (payments)

PayPal Checkout uses the official server SDK (`@paypal/paypal-server-sdk`, Orders v2) in `backend/`. No CLI is required. The React SDK (`@paypal/react-paypal-js`) is also installed in `frontend/` for teams that prefer inline Smart Buttons; the built-in checkout uses PayPal's redirect flow instead:

1. `/orders/checkout` creates the order locally and a matching PayPal Orders v2 order.
2. The browser is sent to PayPal's approval page.
3. PayPal returns to `/checkout/success`, where the backend captures the payment and verifies the amount, currency and order reference before marking the order paid.

Create a REST app at [developer.paypal.com/dashboard/applications](https://developer.paypal.com/dashboard/applications) (use **Sandbox** for local development), then copy its client ID and secret:

```env
# backend/.env
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_ENVIRONMENT=sandbox     # or `live` for production
PAYPAL_WEBHOOK_ID=             # optional, reserved for webhook verification
```

```env
# frontend/.env.local
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...   # only needed for inline Smart Buttons
```

Set **both** backend values, or neither: a partial pair is treated as not configured. When both are blank, the admin-managed `paypal_client_id` / `paypal_client_secret` settings are used instead, so the same keys can be managed under **Admin → Settings → Payment gateways**. The redirect flow needs only the backend pair; `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is read by the browser SDK if you add inline buttons later.

## Running the Application

Open **two terminal windows**.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

API runs at `http://localhost:4000`.

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Storefront runs at `http://localhost:3000`.

## Available Scripts

### Backend (`/backend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot-reload (tsx watch) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled production server |
| `npm run typecheck` | Type-check without emitting |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Migrate + seed |

### Frontend (`/frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (webpack) |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |

## Key Routes

### Storefront

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/products` | Product listing with filters |
| `/products/[slug]` | Product detail page |
| `/categories` | Category browser |
| `/cart` | Shopping cart |
| `/checkout` | Checkout flow |
| `/account` | Customer account dashboard |
| `/wishlist` | Saved items |
| `/login` | Customer sign in |
| `/register` | Customer registration |

### Admin Console

| Route | Description |
|-------|-------------|
| `/admin/login` | Admin sign in |
| `/admin/dashboard` | Dashboard with charts & stats |
| `/admin/products` | Product management (CRUD, export) |
| `/admin/orders` | Order management (tracking, print receipt) |
| `/admin/customers` | Customer management |
| `/admin/categories` | Category management |
| `/admin/brands` | Brand management |
| `/admin/coupons` | Coupon management |
| `/admin/reviews` | Review moderation |
| `/admin/users` | User & staff management |
| `/admin/settings` | Store settings |
| `/admin/notifications` | Notification center |
| `/admin/files` | File manager |

## Default Login Credentials
Admin console: http://localhost:3000/admin/login → redirects to /admin/dashboard
| Role     | Email                      | Password      |
|----------|----------------------------|---------------|
| Admin    | admin@lumerahome.com       | Admin@123     |
| Staff    | staff@lumerahome.com       | Staff@123     |
| Customer | maria.reyes@example.com    | Customer@123  |

## API Overview

All endpoints are prefixed with `/api`. Protected routes require a valid JWT access token (httpOnly cookie) and CSRF token for mutating requests.

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Sign in |
| `POST /api/auth/logout` | Sign out |
| `POST /api/auth/forgot-password` | Request password reset |
| `POST /api/auth/reset-password` | Reset password |
| `GET  /api/auth/me` | Current user profile |
| `GET  /api/products` | List products (paginated, searchable) |
| `GET  /api/products/:id` | Product detail |
| `POST /api/products` | Create product |
| `PUT  /api/products/:id` | Update product |
| `DELETE /api/products/:id` | Delete product |
| `GET  /api/orders` | List orders |
| `POST /api/orders` | Place order |
| `PUT  /api/orders/:id/status` | Update order status |
| `GET  /api/cart` | Get cart |
| `POST /api/cart/items` | Add to cart |
| `GET  /api/categories/tree` | Category tree |
| `GET  /api/brands` | List brands |
| `GET  /api/coupons` | List coupons |
| `GET  /api/reviews` | List reviews |
| `GET  /api/dashboard` | Dashboard stats & charts |
| `GET  /api/users` | List users (admin) |
| `GET  /api/settings` | Store settings |

## Troubleshooting

### MySQL connection errors

- Ensure MySQL is running: `mysql -u root -proot --port=8889 -e "SELECT 1;"`
- Verify `DB_PORT` in `backend/.env` matches your MySQL server (8889 for MAMP, 3306 for Homebrew)
- Confirm the database exists: `npm run db:migrate`

### `Cannot find module 'lightningcss.darwin-x64.node'`

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

Change `PORT` in `backend/.env` or stop the conflicting process.

### Turbopack errors on Apple Silicon (Rosetta)

The dev script already uses `--webpack`. If you see Turbopack errors, ensure `package.json` has `"dev": "next dev --webpack"`.


<img src="https://raw.githubusercontent.com/cai-ro-coders/E-Commerce-Home-Furniture-Using-Next.js-Node-Express/refs/heads/main/1.png" alt="Cairocoders Ednalan">
<img src="https://raw.githubusercontent.com/cai-ro-coders/E-Commerce-Home-Furniture-Using-Next.js-Node-Express/refs/heads/main/2.png" alt="Cairocoders Ednalan">
<img src="https://raw.githubusercontent.com/cai-ro-coders/E-Commerce-Home-Furniture-Using-Next.js-Node-Express/refs/heads/main/3.png" alt="Cairocoders Ednalan">
<img src="https://raw.githubusercontent.com/cai-ro-coders/E-Commerce-Home-Furniture-Using-Next.js-Node-Express/refs/heads/main/4.png" alt="Cairocoders Ednalan">
<img src="https://raw.githubusercontent.com/cai-ro-coders/E-Commerce-Home-Furniture-Using-Next.js-Node-Express/refs/heads/main/5.png" alt="Cairocoders Ednalan">
<img src="https://raw.githubusercontent.com/cai-ro-coders/E-Commerce-Home-Furniture-Using-Next.js-Node-Express/refs/heads/main/6.png" alt="Cairocoders Ednalan">
<img src="https://raw.githubusercontent.com/cai-ro-coders/E-Commerce-Home-Furniture-Using-Next.js-Node-Express/refs/heads/main/7.png" alt="Cairocoders Ednalan">
<img src="https://raw.githubusercontent.com/cai-ro-coders/E-Commerce-Home-Furniture-Using-Next.js-Node-Express/refs/heads/main/8.png" alt="Cairocoders Ednalan">
