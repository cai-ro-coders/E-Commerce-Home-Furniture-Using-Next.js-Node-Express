import Stripe from 'stripe';
import { env } from './env';
import { settingsMap } from '../models/setting.model';

/**
 * Stripe server SDK.
 *
 * The client is created lazily: the server must still boot in development
 * before real keys are configured, and `new Stripe('')` throws immediately.
 *
 * Keys are read from the admin-managed `settings` rows first, so editing them
 * in the admin takes effect immediately, then fall back to the environment.
 * The seed values `sk_test` / `pk_test` are placeholders, not usable keys, so
 * they count as "not configured".
 */
let cached: { key: string; client: Stripe } | null = null;

function usable(value: string | null | undefined, placeholder: string): string {
  const trimmed = (value ?? '').trim();
  return trimmed && trimmed !== placeholder ? trimmed : '';
}

/** The secret key from the admin settings or the environment, if configured. */
export async function stripeSecretKey(): Promise<string> {
  const settings = await settingsMap();
  const managed = usable(settings.stripe_secret_key, 'sk_test');
  return managed || env.payments.stripe.secretKey;
}

/** The publishable key, safe to hand to the browser once an integration needs it. */
export async function stripePublishableKey(): Promise<string> {
  const settings = await settingsMap();
  const managed = usable(settings.stripe_publishable_key, 'pk_test');
  return managed || env.payments.stripe.publishableKey;
}

/** Signing secret for `stripe listen` / dashboard webhooks. Environment only. */
export function stripeWebhookSecret(): string {
  return env.payments.stripe.webhookSecret;
}

/** Whether a usable secret key exists — useful for checkout availability checks. */
export async function isStripeConfigured(): Promise<boolean> {
  return (await stripeSecretKey()) !== '';
}

/**
 * The shared server-side client.
 *
 * Reuses the instance while the key is unchanged, so editing the key in the
 * admin takes effect on the next call without a restart.
 */
export async function getStripeClient(): Promise<Stripe> {
  const key = await stripeSecretKey();
  if (!key) {
    throw new Error(
      'Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env or update the "stripe_secret_key" setting in the admin.'
    );
  }

  if (!cached || cached.key !== key) {
    cached = {
      key,
      client: new Stripe(key, {
        appInfo: { name: 'Lumera Home', version: '1.0.0' },
        maxNetworkRetries: 2,
        timeout: 20_000,
      }),
    };
  }

  return cached.client;
}
