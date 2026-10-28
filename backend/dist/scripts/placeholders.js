"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeholderFolders = void 0;
exports.placeholderSvg = placeholderSvg;
exports.writePlaceholder = writePlaceholder;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
/**
 * Deterministic branded SVG placeholders for the seeded catalogue.
 *
 * The store needs pictures to look real in the admin tables, cart, checkout and
 * receipt. Rather than depend on the network (which would make `db:seed`
 * unreproducible and fail offline) we generate flat-vector artwork locally:
 * a hue derived from the name, a soft gradient background, a simple furniture
 * silhouette and the product label.
 *
 * Everything is derived from the label, so re-running the seed produces
 * byte-identical files.
 */
const FOLDERS = ['products', 'categories', 'brands', 'users', 'files', 'reviews'];
for (const folder of FOLDERS) {
    fs_1.default.mkdirSync(path_1.default.join(env_1.env.uploads.dir, folder), { recursive: true });
}
/** FNV-1a: a stable 32-bit hash so a name always maps to the same colours. */
function hash(value) {
    let h = 0x811c9dc5;
    for (let i = 0; i < value.length; i += 1) {
        h ^= value.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}
function hsl(h, s, l) {
    return `hsl(${h % 360} ${s}% ${l}%)`;
}
/** Wrap text so long product names stay inside the frame. */
function wrap(text, perLine, maxLines) {
    const words = text.split(/\s+/);
    const lines = [];
    let current = '';
    for (const word of words) {
        if ((current + ' ' + word).trim().length > perLine) {
            lines.push(current.trim());
            current = word;
            if (lines.length === maxLines)
                break;
        }
        else {
            current = `${current} ${word}`;
        }
    }
    if (lines.length < maxLines && current.trim())
        lines.push(current.trim());
    const clipped = lines.slice(0, maxLines);
    if (clipped.length === maxLines && words.join(' ').length > clipped.join(' ').length) {
        clipped[maxLines - 1] = `${clipped[maxLines - 1].replace(/[.\s]+$/, '')}…`;
    }
    return clipped;
}
function escapeXml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
const SILHOUETTES = {
    chair: {
        draw: (x, y, w, h, c) => `
    <rect x="${x + w * 0.18}" y="${y + h * 0.06}" width="${w * 0.64}" height="${h * 0.44}" rx="${w * 0.08}" fill="${c}"/>
    <rect x="${x + w * 0.1}" y="${y + h * 0.5}" width="${w * 0.8}" height="${h * 0.12}" rx="${h * 0.05}" fill="${c}"/>
    <rect x="${x + w * 0.16}" y="${y + h * 0.62}" width="${w * 0.06}" height="${h * 0.3}" rx="${h * 0.03}" fill="${c}"/>
    <rect x="${x + w * 0.78}" y="${y + h * 0.62}" width="${w * 0.06}" height="${h * 0.3}" rx="${h * 0.03}" fill="${c}"/>`,
    },
    sofa: {
        draw: (x, y, w, h, c) => `
    <rect x="${x + w * 0.06}" y="${y + h * 0.3}" width="${w * 0.88}" height="${h * 0.34}" rx="${h * 0.1}" fill="${c}"/>
    <rect x="${x + w * 0.02}" y="${y + h * 0.14}" width="${w * 0.16}" height="${h * 0.44}" rx="${h * 0.08}" fill="${c}"/>
    <rect x="${x + w * 0.82}" y="${y + h * 0.14}" width="${w * 0.16}" height="${h * 0.44}" rx="${h * 0.08}" fill="${c}"/>
    <rect x="${x + w * 0.08}" y="${y + h * 0.64}" width="${w * 0.06}" height="${h * 0.2}" rx="${h * 0.03}" fill="${c}"/>
    <rect x="${x + w * 0.86}" y="${y + h * 0.64}" width="${w * 0.06}" height="${h * 0.2}" rx="${h * 0.03}" fill="${c}"/>`,
    },
    table: {
        draw: (x, y, w, h, c) => `
    <rect x="${x + w * 0.04}" y="${y + h * 0.34}" width="${w * 0.92}" height="${h * 0.1}" rx="${h * 0.04}" fill="${c}"/>
    <rect x="${x + w * 0.14}" y="${y + h * 0.44}" width="${w * 0.07}" height="${h * 0.4}" rx="${h * 0.03}" fill="${c}"/>
    <rect x="${x + w * 0.79}" y="${y + h * 0.44}" width="${w * 0.07}" height="${h * 0.4}" rx="${h * 0.03}" fill="${c}"/>`,
    },
    bed: {
        draw: (x, y, w, h, c) => `
    <rect x="${x + w * 0.04}" y="${y + h * 0.34}" width="${w * 0.92}" height="${h * 0.3}" rx="${h * 0.05}" fill="${c}"/>
    <rect x="${x + w * 0.04}" y="${y + h * 0.16}" width="${w * 0.1}" height="${h * 0.3}" rx="${h * 0.05}" fill="${c}"/>
    <rect x="${x + w * 0.17}" y="${y + h * 0.4}" width="${w * 0.22}" height="${h * 0.12}" rx="${h * 0.04}" fill="${c}" opacity="0.65"/>
    <rect x="${x + w * 0.42}" y="${y + h * 0.4}" width="${w * 0.22}" height="${h * 0.12}" rx="${h * 0.04}" fill="${c}" opacity="0.65"/>
    <rect x="${x + w * 0.1}" y="${y + h * 0.64}" width="${w * 0.06}" height="${h * 0.2}" rx="${h * 0.03}" fill="${c}"/>
    <rect x="${x + w * 0.84}" y="${y + h * 0.64}" width="${w * 0.06}" height="${h * 0.2}" rx="${h * 0.03}" fill="${c}"/>`,
    },
    lamp: {
        draw: (x, y, w, h, c) => `
    <path d="M ${x + w * 0.3} ${y + h * 0.34} L ${x + w * 0.7} ${y + h * 0.34} L ${x + w * 0.62} ${y + h * 0.1} L ${x + w * 0.38} ${y + h * 0.1} Z" fill="${c}"/>
    <rect x="${x + w * 0.48}" y="${y + h * 0.34}" width="${w * 0.04}" height="${h * 0.44}" fill="${c}"/>
    <ellipse cx="${x + w * 0.5}" cy="${y + h * 0.8}" rx="${w * 0.2}" ry="${h * 0.04}" fill="${c}"/>`,
    },
    cabinet: {
        draw: (x, y, w, h, c) => `
    <rect x="${x + w * 0.08}" y="${y + h * 0.18}" width="${w * 0.84}" height="${h * 0.58}" rx="${h * 0.04}" fill="${c}"/>
    <rect x="${x + w * 0.5}" y="${y + h * 0.18}" width="${w * 0.012}" height="${h * 0.58}" fill="#000" opacity="0.25"/>
    <rect x="${x + w * 0.44}" y="${y + h * 0.42}" width="${w * 0.03}" height="${h * 0.1}" rx="${w * 0.015}" fill="#000" opacity="0.35"/>
    <rect x="${x + w * 0.53}" y="${y + h * 0.42}" width="${w * 0.03}" height="${h * 0.1}" rx="${w * 0.015}" fill="#000" opacity="0.35"/>`,
    },
    shelf: {
        draw: (x, y, w, h, c) => `
    <rect x="${x + w * 0.08}" y="${y + h * 0.2}" width="${w * 0.84}" height="${h * 0.05}" fill="${c}"/>
    <rect x="${x + w * 0.08}" y="${y + h * 0.44}" width="${w * 0.84}" height="${h * 0.05}" fill="${c}"/>
    <rect x="${x + w * 0.08}" y="${y + h * 0.68}" width="${w * 0.84}" height="${h * 0.05}" fill="${c}"/>
    <rect x="${x + w * 0.12}" y="${y + h * 0.76}" width="${w * 0.76}" height="${h * 0.05}" fill="${c}"/>`,
    },
    decor: {
        draw: (x, y, w, h, c) => `
    <circle cx="${x + w * 0.36}" cy="${y + h * 0.5}" r="${Math.min(w, h) * 0.2}" fill="${c}"/>
    <rect x="${x + w * 0.58}" y="${y + h * 0.28}" width="${w * 0.24}" height="${h * 0.44}" rx="${h * 0.04}" fill="${c}" opacity="0.7"/>`,
    },
    bundle: {
        draw: (x, y, w, h, c) => `
    <rect x="${x + w * 0.1}" y="${y + h * 0.36}" width="${w * 0.8}" height="${h * 0.42}" rx="${h * 0.05}" fill="${c}"/>
    <rect x="${x + w * 0.1}" y="${y + h * 0.28}" width="${w * 0.8}" height="${h * 0.1}" fill="${c}"/>
    <rect x="${x + w * 0.42}" y="${y + h * 0.28}" width="${w * 0.16}" height="${h * 0.5}" fill="#fff" opacity="0.28"/>`,
    },
};
function shapeFor(name) {
    const lower = name.toLowerCase();
    const rules = [
        [/\b(sofa|couch|loveseat|sectional)/, 'sofa'],
        [/\b(chair|armchair|recliner|stool|bench|seat)/, 'chair'],
        [/\b(bed|mattress|pillows?)/, 'bed'],
        [/\b(table|desk|console|dining)/, 'table'],
        [/\b(lamp|light|lighting|chandelier)/, 'lamp'],
        [/\b(cabinet|wardrobe|sideboard|dresser|drawer|storage|shelf|bookcase)/, 'shelf'],
        [/\b(set|kit|bundle|pack|collection)/, 'bundle'],
        [/\b(cushion|rug|mirror|vase|decor|pillow|art|ornament)/, 'decor'],
    ];
    for (const [pattern, shape] of rules) {
        if (pattern.test(lower))
            return shape;
    }
    return 'sofa';
}
/** Build the SVG markup for a placeholder image. */
function placeholderSvg(options = {}) {
    const width = options.width ?? 800;
    const height = options.height ?? 600;
    const label = options.label ?? 'Lumera Home';
    const caption = options.caption ?? '';
    const shape = options.shape ?? shapeFor(label);
    const seed = hash(`${label}|${caption}`);
    const baseHue = seed % 360;
    const hue2 = (baseHue + 28) % 360;
    const bg1 = hsl(baseHue, 32, 94);
    const bg2 = hsl(hue2, 38, 84);
    const ink = hsl(baseHue, 46, 24);
    const inkSoft = hsl(baseHue, 24, 46);
    const form = hsl(baseHue, 44, 62);
    const radius = options.round ? width / 2 : 0;
    const labelLines = wrap(label, 26, 2);
    const captionLines = caption ? wrap(caption, 34, 1) : [];
    const labelTop = height * 0.72;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(label)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <clipPath id="frame"><rect width="${width}" height="${height}" rx="${radius}"/></clipPath>
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <circle cx="${width * 0.82}" cy="${height * 0.16}" r="${width * 0.3}" fill="#ffffff" opacity="0.35"/>
    <circle cx="${width * 0.12}" cy="${height * 0.88}" r="${width * 0.26}" fill="${ink}" opacity="0.06"/>
    ${SILHOUETTES[shape].draw(width * 0.28, height * 0.16, width * 0.44, height * 0.5, form)}
    <text x="${width / 2}" y="${labelTop}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.round(width * 0.045)}" fill="${ink}">${escapeXml(labelLines[0] ?? '')}</text>
    ${labelLines[1]
        ? `<text x="${width / 2}" y="${labelTop + width * 0.055}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.round(width * 0.045)}" fill="${ink}">${escapeXml(labelLines[1])}</text>`
        : ''}
    ${captionLines.length
        ? `<text x="${width / 2}" y="${labelTop + width * 0.11}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(width * 0.026)}" letter-spacing="2" fill="${inkSoft}">${escapeXml(captionLines[0].toUpperCase())}</text>`
        : ''}
    <rect x="${width * 0.42}" y="${height * 0.92}" width="${width * 0.16}" height="3" rx="2" fill="${ink}" opacity="0.35"/>
  </g>
</svg>
`;
}
/** Filename-safe slug used for the generated asset. */
function slugifyFile(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
}
/**
 * Write a placeholder into `uploads/<folder>/<name>.svg` and return the public
 * path that goes in the database (`/uploads/<folder>/<name>.svg`).
 */
function writePlaceholder(folder, name, options = {}) {
    const filename = `${slugifyFile(name) || 'image'}.svg`;
    const target = path_1.default.join(env_1.env.uploads.dir, folder, filename);
    fs_1.default.writeFileSync(target, placeholderSvg(options), 'utf8');
    return `/uploads/${folder}/${filename}`;
}
exports.placeholderFolders = FOLDERS;
//# sourceMappingURL=placeholders.js.map