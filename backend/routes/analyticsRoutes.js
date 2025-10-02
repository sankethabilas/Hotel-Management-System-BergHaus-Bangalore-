import express from 'express';
import { getFeedbackAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// GET /api/analytics/feedback?timeframe=1m
router.get('/feedback', getFeedbackAnalytics);

export default router;
