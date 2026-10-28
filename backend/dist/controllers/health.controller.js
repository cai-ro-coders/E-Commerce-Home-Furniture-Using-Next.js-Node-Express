"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const database_1 = require("../config/database");
const env_1 = require("../config/env");
exports.healthHandler = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    // A real DB round-trip: a 200 that never checked the database is worthless.
    const row = await (0, database_1.queryOne)('SELECT 1 AS ok');
    return (0, ApiResponse_1.ok)(res, {
        status: Number(row?.ok) === 1 ? 'healthy' : 'degraded',
        database: Number(row?.ok) === 1 ? 'up' : 'down',
        environment: env_1.env.nodeEnv,
        uptime_seconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=health.controller.js.map