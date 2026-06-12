/**
 * ============================================
 * FAHADÉ - File Upload Middleware
 * ============================================
 * Multer configuration for handling file uploads.
 * Supports both local storage and Cloudinary
 * cloud storage integration.
 * ============================================
 */

const multer = require('multer');
const path = require('path');

// ============================================
// Local Storage Configuration
// ============================================
const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const fs = require('fs'); // ✅ Import file system

        let uploadPath = 'uploads/products';
        if (req.originalUrl.includes('banner')) {
            uploadPath = 'uploads/banners';
        } else if (req.originalUrl.includes('categor')) {
            uploadPath = 'uploads/categories';
        } else if (req.originalUrl.includes('profile') || req.originalUrl.includes('avatar')) {
            uploadPath = 'uploads/profiles';
        }

        // ✅ Auto-create folder if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: fieldname-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// ============================================
// File Filter - Only allow images
// ============================================
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif)'), false);
    }
};

// ============================================
// Multer Upload Instances
// ============================================

// Product images (up to 6 images)
const uploadProductImages = multer({
    storage: localStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
}).array('images', 6);

// Banner image (single image)
const uploadBannerImage = multer({
    storage: localStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
}).single('image');

// Profile avatar (single image)
const uploadAvatar = multer({
    storage: localStorage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
}).single('avatar');

module.exports = {
    uploadProductImages,
    uploadBannerImage,
    uploadAvatar,
};

// ✅ NEW: Category Image Upload (single image)
const uploadCategoryImage = multer({
    storage: localStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
}).single('image');

module.exports = {
    uploadProductImages,
    uploadBannerImage,
    uploadAvatar,
    uploadCategoryImage, // ✅ NEW EXPORT
};