"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
exports.activityLogger = activityLogger;
const database_1 = require("../config/database");
/**
 * Write a row to `user_activities`. Used by the back-office activity log and
 * by the auth flow. Failures are swallowed: audit logging must never turn a
 * successful business operation into a 500.
 */
function logActivity(req, userId, options) {
    const ipAddress = req.ip ?? null;
    const userAgent = req.headers['user-agent']?.slice(0, 255) ?? null;
    const run = (0, database_1.execute)(`INSERT INTO user_activities (user_id, action, entity, entity_id, description, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        userId,
        options.action,
        options.entity ?? null,
        options.entityId ?? null,
        options.description ?? null,
        ipAddress,
        userAgent,
    ]).catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[activity-log] failed to record activity', error);
    });
    if (options.async === false)
        return;
    void run;
}
/** Express middleware factory for straightforward "entity was mutated" logging. */
function activityLogger(options) {
    return (req, res, next) => {
        res.on('finish', () => {
            if (!req.user || res.statusCode >= 400)
                return;
            const entityId = req.params?.id ?? null;
            logActivity(req, req.user.id, {
                ...options,
                entityId: options.entityId ?? entityId,
            });
        });
        next();
    };
}
//# sourceMappingURL=activityLog.js.map