"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/**
 * Tiny structured logger. Keeps the output readable in a terminal while still
 * prefixing machine-friendly levels and timestamps for log aggregation.
 */
const timestamp = () => new Date().toISOString();
function write(level, message, meta) {
    const line = `${timestamp()} [${level}] ${message}`;
    if (meta === undefined) {
        console.log(line);
        return;
    }
    if (meta instanceof Error) {
        console.error(line, meta.stack ?? meta.message);
        return;
    }
    console.log(line, typeof meta === 'string' ? meta : JSON.stringify(meta));
}
exports.logger = {
    info: (message, meta) => write('INFO', message, meta),
    warn: (message, meta) => write('WARN', message, meta),
    error: (message, meta) => write('ERROR', message, meta),
    debug: (message, meta) => {
        if (process.env.DEBUG)
            write('DEBUG', message, meta);
    },
};
//# sourceMappingURL=logger.js.map