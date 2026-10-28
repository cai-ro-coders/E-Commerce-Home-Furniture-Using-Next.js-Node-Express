"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeSecretKey = stripeSecretKey;
exports.stripePublishableKey = stripePublishableKey;
exports.stripeWebhookSecret = stripeWebhookSecret;
exports.isStripeConfigured = isStripeConfigured;
exports.getStripeClient = getStripeClient;
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("./env");
const setting_model_1 = require("../models/setting.model");
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
let cached = null;
function usable(value, placeholder) {
    const trimmed = (value ?? '').trim();
    return trimmed && trimmed !== placeholder ? trimmed : '';
}
/** The secret key from the admin settings or the environment, if configured. */
async function stripeSecretKey() {
    const settings = await (0, setting_model_1.settingsMap)();
    const managed = usable(settings.stripe_secret_key, 'sk_test');
    return managed || env_1.env.payments.stripe.secretKey;
}
/** The publishable key, safe to hand to the browser once an integration needs it. */
async function stripePublishableKey() {
    const settings = await (0, setting_model_1.settingsMap)();
    const managed = usable(settings.stripe_publishable_key, 'pk_test');
    return managed || env_1.env.payments.stripe.publishableKey;
}
/** Signing secret for `stripe listen` / dashboard webhooks. Environment only. */
function stripeWebhookSecret() {
    return env_1.env.payments.stripe.webhookSecret;
}
/** Whether a usable secret key exists — useful for checkout availability checks. */
async function isStripeConfigured() {
    return (await stripeSecretKey()) !== '';
}
/**
 * The shared server-side client.
 *
 * Reuses the instance while the key is unchanged, so editing the key in the
 * admin takes effect on the next call without a restart.
 */
async function getStripeClient() {
    const key = await stripeSecretKey();
    if (!key) {
        throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env or update the "stripe_secret_key" setting in the admin.');
    }
    if (!cached || cached.key !== key) {
        cached = {
            key,
            client: new stripe_1.default(key, {
                appInfo: { name: 'Lumera Home', version: '1.0.0' },
                maxNetworkRetries: 2,
                timeout: 20_000,
            }),
        };
    }
    return cached.client;
}
//# sourceMappingURL=stripe.js.map