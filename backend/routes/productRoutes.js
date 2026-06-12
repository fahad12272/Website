/**
 * ============================================
 * FAHADÉ - Product Routes
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

// ============================================
// PUBLIC ROUTES
// ============================================

// GET /api/products - All products with filters
router.get('/', productController.getProducts);

// GET /api/products/flash-sale - Active flash sale products
router.get('/flash-sale', productController.getFlashSaleProducts);

// GET /api/products/trending - Trending products
router.get('/trending', productController.getTrendingProducts);

// GET /api/products/recommendations - Smart recommendations
router.get('/recommendations', productController.getRecommendations);

// GET /api/products/search - Search products
router.get('/search', productController.searchProducts);

// GET /api/products/:slug - Single product (uses optionalAuth to track recently viewed)
router.get('/:slug', optionalAuth, productController.getProduct);

module.exports = router;