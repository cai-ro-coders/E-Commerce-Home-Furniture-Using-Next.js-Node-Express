import { createApp } from './app';
import { env } from './config/env';
import { assertDatabaseConnection, closePool } from './config/database';
import { purgeExpiredSessions } from './services/auth.service';
import { logger } from './utils/logger';

const app = createApp();

/** Hourly housekeeping: drop refresh sessions that expired over a day ago. */
const SESSION_SWEEP_MS = 60 * 60 * 1000;
let sweepTimer: NodeJS.Timeout | null = null;

async function start(): Promise<void> {
  // Fail fast and loudly rather than serving 500s from a dead pool.
  await assertDatabaseConnection();
  logger.info('Database connection established');

  const server = app.listen(env.port, () => {
    logger.info(`API listening on ${env.apiUrl}${env.apiPrefix} (${env.nodeEnv})`);
    logger.info(`CORS origins: ${env.cors.origins.join(', ')}`);
  });

  sweepTimer = setInterval(() => {
    purgeExpiredSessions()
      .then((removed) => {
        if (removed > 0) logger.info(`Purged ${removed} expired session(s)`);
      })
      .catch((error) => logger.error('Session sweep failed', error));
  }, SESSION_SWEEP_MS);
  sweepTimer.unref();

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`${signal} received — shutting down`);

    if (sweepTimer) clearInterval(sweepTimer);
    server.close(async () => {
      try {
        await closePool();
        logger.info('Database pool closed');
      } catch (error) {
        logger.error('Failed to close the database pool cleanly', error);
      }
      process.exit(0);
    });

    // Do not hang forever on a stuck connection.
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection', reason));
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception — exiting', error);
    shutdown('uncaughtException');
  });
}

start().catch((error) => {
  logger.error('Failed to start the API server', error);
  process.exit(1);
});
