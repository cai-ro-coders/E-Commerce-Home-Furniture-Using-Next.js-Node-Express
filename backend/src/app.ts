import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimit';
import { csrfProtection } from './middleware/csrf';
import { errorHandler, notFoundHandler, xssSanitize } from './middleware/errorHandler';
import { dataTablesAdapter } from './middleware/dataTables';
import { stripeWebhookHandler } from './controllers/order.controller';
import apiRoutes from './routes';

export function createApp(): Application {
  const app = express();

  // Required for `req.ip` and `trust proxy` to behave correctly behind a proxy.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      // Uploaded images are served from a different origin (the API host) than
      // the storefront, so the default same-origin policy would block them.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: env.isProduction ? undefined : false,
    })
  );

  // `credentials: true` + an explicit origin allow-list: `*` is illegal with
  // credentials, and reflecting an arbitrary Origin would defeat the point.
  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin/curl/server-to-server requests have no Origin header.
        if (!origin) {
          callback(null, true);
          return;
        }
        callback(null, env.cors.origins.includes(origin));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
      exposedHeaders: ['x-csrf-token', 'Content-Disposition'],
      maxAge: 86400,
    })
  );

  // Stripe signs the raw request body, so this route must run before the JSON
  // parser turns it into an object. It is also outside the CSRF/session stack
  // because Stripe cannot send either.
  app.post(
    `${env.apiPrefix}/orders/stripe/webhook`,
    express.raw({ type: 'application/json', limit: '1mb' }),
    stripeWebhookHandler
  );

  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  // Strip script/event payloads from anything that arrives in a body or query.
  app.use(xssSanitize);

  // Uploaded product photos, brand logos and seeded placeholder art.
  fs.mkdirSync(env.uploads.dir, { recursive: true });
  app.use(
    '/uploads',
    express.static(env.uploads.dir, {
      maxAge: env.isProduction ? '30d' : 0,
      index: false,
      dotfiles: 'deny',
    })
  );

  app.use(`${env.apiPrefix}/uploads`, express.static(env.uploads.dir, { index: false }));

  app.use(env.apiPrefix, csrfProtection, apiLimiter, dataTablesAdapter, apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
