"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paypalCredentials = paypalCredentials;
exports.paypalClientId = paypalClientId;
exports.paypalWebhookId = paypalWebhookId;
exports.isPayPalConfigured = isPayPalConfigured;
exports.getPayPalClient = getPayPalClient;
const paypal_server_sdk_1 = require("@paypal/paypal-server-sdk");
const env_1 = require("./env");
const setting_model_1 = require("../models/setting.model");
let cached = null;
function usable(value) {
    const trimmed = (value ?? '').trim();
    return trimmed && trimmed !== 'test' ? trimmed : '';
}
function pair(clientId, clientSecret) {
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
async function paypalCredentials() {
    const settings = await (0, setting_model_1.settingsMap)();
    const fromEnv = pair(env_1.env.payments.paypal.clientId, env_1.env.payments.paypal.clientSecret);
    const fromSettings = pair(settings.paypal_client_id, settings.paypal_client_secret);
    const active = fromEnv ?? fromSettings;
    return active ? { ...active, environment: env_1.env.payments.paypal.environment } : null;
}
/** The client id, safe to hand to the browser once checkout needs it. */
async function paypalClientId() {
    return (await paypalCredentials())?.clientId ?? '';
}
/** Signing id for webhook verification. Environment only. */
function paypalWebhookId() {
    return env_1.env.payments.paypal.webhookId;
}
/** Whether a complete credential pair exists — used for checkout availability. */
async function isPayPalConfigured() {
    return (await paypalCredentials()) !== null;
}
/**
 * The shared server-side client.
 *
 * Reuses the instance while the credentials and environment are unchanged, so
 * editing them in the admin takes effect on the next call without a restart.
 */
async function getPayPalClient() {
    const credentials = await paypalCredentials();
    if (!credentials) {
        throw new Error('PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in backend/.env, or update the "paypal_client_id" / "paypal_client_secret" settings in the admin.');
    }
    const key = `${credentials.clientId}:${credentials.clientSecret}`;
    if (!cached || cached.key !== key || cached.environment !== credentials.environment) {
        cached = {
            key,
            environment: credentials.environment,
            client: new paypal_server_sdk_1.Client({
                clientCredentialsAuthCredentials: {
                    oAuthClientId: credentials.clientId,
                    oAuthClientSecret: credentials.clientSecret,
                },
                environment: credentials.environment === 'live' ? paypal_server_sdk_1.Environment.Production : paypal_server_sdk_1.Environment.Sandbox,
                timeout: 20_000,
            }),
        };
    }
    return cached.client;
}
//# sourceMappingURL=paypal.js.map