/**
 * News API routes
 */

import { Router } from 'express';
import { NewsController } from '../controllers/NewsController';

const router = Router();
const newsController = new NewsController();

/**
 * @route   GET /api/v1/news/search
 * @desc    Search news articles
 * @access  Public
 * @query   q (required), sources, from, to, language, sortBy, pageSize, page
 */
router.get('/search', newsController.searchNews);

/**
 * @route   GET /api/v1/news/headlines
 * @desc    Get top headlines
 * @access  Public
 * @query   country, category
 */
router.get('/headlines', newsController.getTopHeadlines);

export default router;
