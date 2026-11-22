/**
 * Health and admin routes
 */

import { Router } from 'express';
import { NewsController } from '../controllers/NewsController';

const router = Router();
const newsController = new NewsController();

/**
 * @route   GET /api/v1/health
 * @desc    Get service health status
 * @access  Public
 */
router.get('/', newsController.getHealth);

/**
 * @route   POST /api/v1/admin/cache/clear
 * @desc    Clear cache
 * @access  Admin (should add auth middleware in production)
 */
router.post('/admin/cache/clear', newsController.clearCache);

export default router;
