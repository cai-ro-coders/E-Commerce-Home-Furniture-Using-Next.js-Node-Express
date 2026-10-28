"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load `.env` from the backend root regardless of the process cwd.
const backendRoot = path_1.default.resolve(__dirname, '..', '..');
const envPath = path_1.default.join(backendRoot, '.env');
if (fs_1.default.existsSync(envPath)) {
    dotenv_1.default.config({ path: envPath });
}
function str(key, fallback) {
    const value = process.env[key];
    if (value === undefined || value === '') {
        if (fallback !== undefined)
            return fallback;
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
function num(key, fallback) {
    const value = process.env[key];
    if (value === undefined || value === '')
        return fallback;
    const parsed = Number(value);
    if (Number.isNaN(parsed))
        throw new Error(`Environment variable ${key} must be a number`);
    return parsed;
}
function bool(key, fallback) {
    const value = process.env[key];
    if (value === undefined || value === '')
        return fallback;
    return value === 'true' || value === '1';
}
function list(key, fallback) {
    const value = process.env[key];
    if (!value)
        return fallback;
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}
const isProduction = str('NODE_ENV', 'development') === 'production';
exports.env = {
    backendRoot,
    nodeEnv: str('NODE_ENV', 'development'),
    isProduction,
    port: num('PORT', 4000),
    apiPrefix: str('API_PREFIX', '/api'),
    apiUrl: str('API_URL', 'http://localhost:4000'),
    /**
     * Public URL of the storefront. Stripe redirects the browser back here after
     * checkout, so it must be reachable from the customer's browser.
     */
    appUrl: str('APP_URL', list('CORS_ORIGINS', ['http://localhost:3000'])[0]),
    db: {
        host: str('DB_HOST', '127.0.0.1'),
        port: num('DB_PORT', 8889),
        user: str('DB_USER', 'root'),
        password: str('DB_PASSWORD', 'root'),
        database: str('DB_NAME', 'ecommerce_nextjsDB'),
        connectionLimit: num('DB_CONNECTION_LIMIT', 10),
    },
    auth: {
        jwtSecret: str('JWT_SECRET'),
        accessExpires: str('JWT_ACCESS_EXPIRES', '15m'),
        refreshExpires: str('JWT_REFRESH_EXPIRES', '7d'),
        cookieName: 'access_token',
        refreshCookieName: 'refresh_token',
        cookieDomain: process.env.COOKIE_DOMAIN || undefined,
        csrfProtection: bool('CSRF_PROTECTION', true),
        xssSanitize: bool('XSS_SANITIZE', true),
    },
    cors: {
        origins: list('CORS_ORIGINS', ['http://localhost:3000']),
    },
    payments: {
        stripe: {
            // Optional here: the admin-managed `stripe_secret_key` setting is used
            // when these are blank. See `config/stripe.ts`.
            secretKey: process.env.STRIPE_SECRET_KEY ?? '',
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
        },
        paypal: {
            // Same fallback as Stripe: `paypal_client_id` / `paypal_client_secret`
            // in the settings table. See `config/paypal.ts`.
            clientId: process.env.PAYPAL_CLIENT_ID ?? '',
            clientSecret: process.env.PAYPAL_CLIENT_SECRET ?? '',
            environment: process.env.PAYPAL_ENVIRONMENT === 'live' ? 'live' : 'sandbox',
            webhookId: process.env.PAYPAL_WEBHOOK_ID ?? '',
        },
    },
    uploads: {
        dir: path_1.default.resolve(backendRoot, str('UPLOAD_DIR', 'uploads')),
        maxSizeBytes: num('MAX_UPLOAD_SIZE_MB', 8) * 1024 * 1024,
    },
    rateLimit: {
        windowMs: num('RATE_LIMIT_WINDOW_MINUTES', 15) * 60 * 1000,
        max: num('RATE_LIMIT_MAX', 500),
        authMax: num('AUTH_RATE_LIMIT_MAX', 20),
    },
    defaults: {
        siteName: str('SITE_NAME', 'Lumera Home'),
        currency: str('CURRENCY', 'PHP'),
        taxRate: num('TAX_RATE', 0.12),
        shippingFee: num('SHIPPING_FEE', 250),
    },
};
if (isProduction && exports.env.auth.jwtSecret.includes('dev_only_change_me')) {
    throw new Error('JWT_SECRET must be set to a strong random value in production');
}
//# sourceMappingURL=env.js.map