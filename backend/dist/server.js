"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const auth_service_1 = require("./services/auth.service");
const logger_1 = require("./utils/logger");
const app = (0, app_1.createApp)();
/** Hourly housekeeping: drop refresh sessions that expired over a day ago. */
const SESSION_SWEEP_MS = 60 * 60 * 1000;
let sweepTimer = null;
async function start() {
    // Fail fast and loudly rather than serving 500s from a dead pool.
    await (0, database_1.assertDatabaseConnection)();
    logger_1.logger.info('Database connection established');
    const server = app.listen(env_1.env.port, () => {
        logger_1.logger.info(`API listening on ${env_1.env.apiUrl}${env_1.env.apiPrefix} (${env_1.env.nodeEnv})`);
        logger_1.logger.info(`CORS origins: ${env_1.env.cors.origins.join(', ')}`);
    });
    sweepTimer = setInterval(() => {
        (0, auth_service_1.purgeExpiredSessions)()
            .then((removed) => {
            if (removed > 0)
                logger_1.logger.info(`Purged ${removed} expired session(s)`);
        })
            .catch((error) => logger_1.logger.error('Session sweep failed', error));
    }, SESSION_SWEEP_MS);
    sweepTimer.unref();
    let shuttingDown = false;
    const shutdown = (signal) => {
        if (shuttingDown)
            return;
        shuttingDown = true;
        logger_1.logger.info(`${signal} received — shutting down`);
        if (sweepTimer)
            clearInterval(sweepTimer);
        server.close(async () => {
            try {
                await (0, database_1.closePool)();
                logger_1.logger.info('Database pool closed');
            }
            catch (error) {
                logger_1.logger.error('Failed to close the database pool cleanly', error);
            }
            process.exit(0);
        });
        // Do not hang forever on a stuck connection.
        setTimeout(() => {
            logger_1.logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10_000).unref();
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('unhandledRejection', (reason) => logger_1.logger.error('Unhandled rejection', reason));
    process.on('uncaughtException', (error) => {
        logger_1.logger.error('Uncaught exception — exiting', error);
        shutdown('uncaughtException');
    });
}
start().catch((error) => {
    logger_1.logger.error('Failed to start the API server', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map