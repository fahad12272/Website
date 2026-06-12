/**
 * ============================================
 * FAHADÉ - Admin Routes (Supplier Supported)
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOrSupplier } = require('../middleware/adminMiddleware');
const {
    uploadProductImages,
    uploadBannerImage,
    uploadCategoryImage
} = require('../middleware/uploadMiddleware');
const adminController = require('../controllers/adminController');

// ✅ All admin routes require auth + admin OR supplier role
router.use(protect, adminOrSupplier);

// ============================================
// PRODUCT MANAGEMENT
// ============================================
router.get('/products', adminController.adminGetProducts);
router.post('/products', uploadProductImages, adminController.createProduct);
router.put('/products/:id', uploadProductImages, adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// ============================================
// ORDER MANAGEMENT
// ============================================
router.get('/orders', adminController.adminGetOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.put('/orders/:id/payment', adminController.updatePaymentStatus);

// ============================================
// USER MANAGEMENT (✅ Only ONCE, after middleware)
// ============================================
router.get('/users', adminController.adminGetUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// ============================================
// CATEGORY MANAGEMENT
// ============================================
router.get('/categories', adminController.adminGetCategories);
router.post('/categories', uploadCategoryImage, adminController.createCategory);
router.put('/categories/:id', uploadCategoryImage, adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// ============================================
// COUPON MANAGEMENT
// ============================================
router.get('/coupons', adminController.adminGetCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// ============================================
// BANNER MANAGEMENT
// ============================================
router.get('/banners', adminController.adminGetBanners);
router.post('/banners', uploadBannerImage, adminController.createBanner);
router.put(
    '/banners/:id',
    uploadBannerImage,
    adminController.updateBanner
);
router.delete('/banners/:id', adminController.deleteBanner);

// ============================================
// FLASH SALE MANAGEMENT
// ============================================
router.put('/flash-sale/:id', adminController.manageFlashSale);

// ============================================
// INVENTORY MANAGEMENT
// ============================================
router.put('/inventory/:id', adminController.updateInventory);
router.get('/inventory/low-stock', adminController.getLowStockAlerts);

module.exports = router;