import { Router } from 'express';
import { healthHandler } from '../controllers/health.controller';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import customerRoutes from './customer.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import brandRoutes from './brand.routes';
import orderRoutes from './order.routes';
import couponRoutes from './coupon.routes';
import reviewRoutes from './review.routes';
import settingRoutes from './setting.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import dashboardRoutes from './dashboard.routes';
import fileRoutes from './file.routes';
import notificationRoutes from './notification.routes';
import contactRoutes from './contact.routes';
import uploadRoutes from './upload.routes';
import { ok } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';

const router = Router();

router.get('/health', healthHandler);

// Liveness probe for the admin dashboard's "API status" widget.
router.get(
  '/ping',
  asyncHandler(async (_req, res) => ok(res, { message: 'pong', env: env.nodeEnv }))
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);
router.use('/settings', settingRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/files', fileRoutes);
router.use('/notifications', notificationRoutes);
router.use('/contact', contactRoutes);
router.use('/upload', uploadRoutes);

export default router;
