const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware'); // ✅ FIXED: Destructuring import
const analyticsController = require('../controllers/analyticsController');

router.get('/dashboard', protect, admin, analyticsController.getDashboardStats);
router.get('/sales-report', protect, admin, analyticsController.getSalesReport);

module.exports = router;