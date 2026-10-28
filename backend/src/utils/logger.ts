/* eslint-disable no-console */

/**
 * Tiny structured logger. Keeps the output readable in a terminal while still
 * prefixing machine-friendly levels and timestamps for log aggregation.
 */
const timestamp = () => new Date().toISOString();

function write(level: string, message: string, meta?: unknown): void {
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

export const logger = {
  info: (message: string, meta?: unknown) => write('INFO', message, meta),
  warn: (message: string, meta?: unknown) => write('WARN', message, meta),
  error: (message: string, meta?: unknown) => write('ERROR', message, meta),
  debug: (message: string, meta?: unknown) => {
    if (process.env.DEBUG) write('DEBUG', message, meta);
  },
};
