"use strict";
/**
 * Order pricing maths, in one place.
 *
 * The cart summary and the order-creation transaction must agree to the peso.
 * When they each carried their own copy, the tax rate drifted (`tax_rate` is a
 * whole percentage in `settings`, not a fraction) and the cart quoted a total
 * the checkout page then refused. Both call this instead.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.round2 = round2;
exports.computeTotals = computeTotals;
function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
function computeTotals(input) {
    const subtotal = Math.max(0, round2(input.subtotal ?? 0));
    const discount = Math.min(subtotal, Math.max(0, round2(input.discount ?? 0)));
    const payable = round2(subtotal - discount);
    const percent = Number(input.taxRatePercent ?? 12);
    const taxRate = Number.isFinite(percent) ? percent / 100 : 0;
    const tax = round2(payable * taxRate);
    const flatShipping = Math.max(0, round2(input.shippingFee ?? 0));
    const threshold = Math.max(0, round2(input.freeShippingThreshold ?? 0));
    const freeShipping = threshold > 0 && payable >= threshold;
    const shippingFee = freeShipping ? 0 : flatShipping;
    return {
        subtotal,
        discount,
        shippingFee,
        tax,
        grandTotal: round2(payable + shippingFee + tax),
        freeShipping,
    };
}
//# sourceMappingURL=pricing.js.map