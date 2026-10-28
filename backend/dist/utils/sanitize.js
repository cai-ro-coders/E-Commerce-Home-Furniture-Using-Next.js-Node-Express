"use strict";
/**
 * XSS sanitisation.
 *
 * Defence in depth, in layers:
 *   1. Helmet sets security headers (CSP, X-Content-Type-Options, ...) — see app.ts
 *   2. This module neutralises obvious payloads in request payloads
 *   3. React escapes on render, so we never use dangerouslySetInnerHTML for
 *      user content anywhere in the admin UI
 *
 * Note: this deliberately does NOT try to "clean" HTML into safe HTML. Product
 * descriptions are stored as text and rendered as text.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeString = sanitizeString;
exports.sanitizeDeep = sanitizeDeep;
exports.slugify = slugify;
const BLOCKED_TAG_PATTERN = /<\/?\s*(script|iframe|object|embed|link|meta|base|form|svg|math|style)\b[^>]*>/gi;
const EVENT_HANDLER_PATTERN = /\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const DANGEROUS_URI_PATTERN = /(javascript|vbscript|data)\s*:/gi;
const NULL_BYTE_PATTERN = /\u0000/g;
function sanitizeString(value) {
    return value
        .replace(NULL_BYTE_PATTERN, '')
        .replace(BLOCKED_TAG_PATTERN, '')
        .replace(EVENT_HANDLER_PATTERN, '')
        .replace(DANGEROUS_URI_PATTERN, '');
}
/**
 * Recursively sanitise every string inside a payload. Handles plain objects and
 * arrays; anything else (Date, Buffer, ...) is passed through untouched.
 */
function sanitizeDeep(value, depth = 0) {
    // Guard against pathological nesting causing a stack overflow.
    if (depth > 20)
        return value;
    if (typeof value === 'string')
        return sanitizeString(value);
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeDeep(item, depth + 1));
    }
    if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
        const output = {};
        for (const [key, item] of Object.entries(value)) {
            // Drop prototype-pollution vectors outright.
            if (key === '__proto__' || key === 'constructor' || key === 'prototype')
                continue;
            output[key] = sanitizeDeep(item, depth + 1);
        }
        return output;
    }
    return value;
}
/** Strip characters that are never valid in a slug and normalise to kebab-case. */
function slugify(value) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 180);
}
//# sourceMappingURL=sanitize.js.map