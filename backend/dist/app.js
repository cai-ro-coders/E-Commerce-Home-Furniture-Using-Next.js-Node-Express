"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./config/env");
const rateLimit_1 = require("./middleware/rateLimit");
const csrf_1 = require("./middleware/csrf");
const errorHandler_1 = require("./middleware/errorHandler");
const dataTables_1 = require("./middleware/dataTables");
const order_controller_1 = require("./controllers/order.controller");
const routes_1 = __importDefault(require("./routes"));
function createApp() {
    const app = (0, express_1.default)();
    // Required for `req.ip` and `trust proxy` to behave correctly behind a proxy.
    app.set('trust proxy', 1);
    app.disable('x-powered-by');
    app.use((0, helmet_1.default)({
        // Uploaded images are served from a different origin (the API host) than
        // the storefront, so the default same-origin policy would block them.
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: env_1.env.isProduction ? undefined : false,
    }));
    // `credentials: true` + an explicit origin allow-list: `*` is illegal with
    // credentials, and reflecting an arbitrary Origin would defeat the point.
    app.use((0, cors_1.default)({
        origin(origin, callback) {
            // Same-origin/curl/server-to-server requests have no Origin header.
            if (!origin) {
                callback(null, true);
                return;
            }
            callback(null, env_1.env.cors.origins.includes(origin));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
        exposedHeaders: ['x-csrf-token', 'Content-Disposition'],
        maxAge: 86400,
    }));
    // Stripe signs the raw request body, so this route must run before the JSON
    // parser turns it into an object. It is also outside the CSRF/session stack
    // because Stripe cannot send either.
    app.post(`${env_1.env.apiPrefix}/orders/stripe/webhook`, express_1.default.raw({ type: 'application/json', limit: '1mb' }), order_controller_1.stripeWebhookHandler);
    app.use((0, compression_1.default)());
    app.use(express_1.default.json({ limit: '2mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, morgan_1.default)(env_1.env.isProduction ? 'combined' : 'dev'));
    // Strip script/event payloads from anything that arrives in a body or query.
    app.use(errorHandler_1.xssSanitize);
    // Uploaded product photos, brand logos and seeded placeholder art.
    fs_1.default.mkdirSync(env_1.env.uploads.dir, { recursive: true });
    app.use('/uploads', express_1.default.static(env_1.env.uploads.dir, {
        maxAge: env_1.env.isProduction ? '30d' : 0,
        index: false,
        dotfiles: 'deny',
    }));
    app.use(`${env_1.env.apiPrefix}/uploads`, express_1.default.static(env_1.env.uploads.dir, { index: false }));
    app.use(env_1.env.apiPrefix, csrf_1.csrfProtection, rateLimit_1.apiLimiter, dataTables_1.dataTablesAdapter, routes_1.default);
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
exports.default = createApp;
//# sourceMappingURL=app.js.map