"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCsv = toCsv;
/**
 * CSV generation for the "export to CSV / download all orders" features.
 * Values are escaped per RFC 4180 and formula-injection is neutralised so a
 * product name like `=cmd|...` cannot execute when the file is opened in Excel.
 */
const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];
function escapeCell(value) {
    if (value === null || value === undefined)
        return '';
    let text = String(value);
    // Neutralise spreadsheet formula injection.
    if (FORMULA_PREFIXES.some((prefix) => text.startsWith(prefix))) {
        text = `'${text}`;
    }
    if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}
function toCsv(rows, columns) {
    const header = columns.map((column) => escapeCell(column.header)).join(',');
    const lines = rows.map((row) => {
        const record = row;
        return columns
            .map((column) => escapeCell(column.map ? column.map(row) : record[column.key]))
            .join(',');
    });
    return [header, ...lines].join('\r\n');
}
//# sourceMappingURL=csv.js.map