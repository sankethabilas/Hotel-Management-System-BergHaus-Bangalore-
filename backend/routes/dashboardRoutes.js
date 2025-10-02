import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

// GET /api/dashboard/stats?timeframe=30d
router.get('/stats', getDashboardStats);

export default router;
