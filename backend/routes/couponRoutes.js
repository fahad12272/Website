const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const couponController = require('../controllers/couponController');

router.post('/validate', protect, couponController.validateCoupon);

module.exports = router;