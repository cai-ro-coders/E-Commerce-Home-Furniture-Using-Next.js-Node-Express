"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = (0, express_1.Router)();
// The dashboard summarises revenue, so it is staff-only.
router.use(auth_1.authenticate, rbac_1.requireStaff);
router.get('/', dashboard_controller_1.dashboardHandler);
router.get('/calendar', dashboard_controller_1.calendarHandler);
router.get('/sales-analytics', dashboard_controller_1.salesAnalyticsHandler);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map