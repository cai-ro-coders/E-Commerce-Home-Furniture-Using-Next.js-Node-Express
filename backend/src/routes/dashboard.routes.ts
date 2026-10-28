import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireStaff } from '../middleware/rbac';
import {
  calendarHandler,
  dashboardHandler,
  salesAnalyticsHandler,
} from '../controllers/dashboard.controller';

const router = Router();

// The dashboard summarises revenue, so it is staff-only.
router.use(authenticate, requireStaff);

router.get('/', dashboardHandler);
router.get('/calendar', calendarHandler);
router.get('/sales-analytics', salesAnalyticsHandler);

export default router;
