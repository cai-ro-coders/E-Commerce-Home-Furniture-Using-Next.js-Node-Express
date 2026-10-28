import { Client, Environment } from '@paypal/paypal-server-sdk';
import { env } from './env';
import { settingsMap } from '../models/setting.model';

/**
 * PayPal Checkout (Orders v2) server SDK.
 *
 * Like the Stripe client, this is created lazily: the API must boot before
 * credentials exist, and the SDK rejects an empty client id/secret.
 *
 * Both credentials are read as a pair. The environment wins when set, then the
 * admin-managed `paypal_client_id` / `paypal_client_secret` settings are used.
 * Mixing a client id from one app with a secret from another produces confusing
 * `invalid_client` errors, so a partial pair counts as "not configured".
 * The seed values `test` are placeholders, not usable credentials.
 */
export interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'live';
}

let cached:
  | { key: string; environment: 'sandbox' | 'live'; client: Client }
  | null = null;

function usable(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim();
  return trimmed && trimmed !== 'test' ? trimmed : '';
}

function pair(clientId: string, clientSecret: string): { clientId: string; clientSecret: string } | null {
  const id = usable(clientId);
  const secret = usable(clientSecret);
  return id && secret ? { clientId: id, clientSecret: secret } : null;
}

/**
 * The active credentials, or `null` while the integration is not configured.
 *
 * The environment is chosen by `PAYPAL_ENVIRONMENT` (`sandbox` by default), so
 * the same admin settings can be reused for live once the env is switched.
 */
export async function paypalCredentials(): Promise<PayPalCredentials | null> {
  const settings = await settingsMap();

  const fromEnv = pair(env.payments.paypal.clientId, env.payments.paypal.clientSecret);
  const fromSettings = pair(settings.paypal_client_id, settings.paypal_client_secret);
  const active = fromEnv ?? fromSettings;

  return active ? { ...active, environment: env.payments.paypal.environment } : null;
}

/** The client id, safe to hand to the browser once checkout needs it. */
export async function paypalClientId(): Promise<string> {
  return (await paypalCredentials())?.clientId ?? '';
}

/** Signing id for webhook verification. Environment only. */
export function paypalWebhookId(): string {
  return env.payments.paypal.webhookId;
}

/** Whether a complete credential pair exists — used for checkout availability. */
export async function isPayPalConfigured(): Promise<boolean> {
  return (await paypalCredentials()) !== null;
}

/**
 * The shared server-side client.
 *
 * Reuses the instance while the credentials and environment are unchanged, so
 * editing them in the admin takes effect on the next call without a restart.
 */
export async function getPayPalClient(): Promise<Client> {
  const credentials = await paypalCredentials();
  if (!credentials) {
    throw new Error(
      'PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in backend/.env, or update the "paypal_client_id" / "paypal_client_secret" settings in the admin.'
    );
  }

  const key = `${credentials.clientId}:${credentials.clientSecret}`;
  if (!cached || cached.key !== key || cached.environment !== credentials.environment) {
    cached = {
      key,
      environment: credentials.environment,
      client: new Client({
        clientCredentialsAuthCredentials: {
          oAuthClientId: credentials.clientId,
          oAuthClientSecret: credentials.clientSecret,
        },
        environment:
          credentials.environment === 'live' ? Environment.Production : Environment.Sandbox,
        timeout: 20_000,
      }),
    };
  }

  return cached.client;
}
