/**
 * ============================================
 * FAHADÉ - Main Server Entry Point
 * ============================================
 * This is the heart of the backend application.
 * Sets up Express with all middleware, routes,
 * and error handling for production use.
 * ============================================
 */

// Load environment variables FIRST before anything else
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer'); // ✅ NEW XSS SANITIZER
const hpp = require('hpp');
const morgan = require('morgan');

// Internal imports
const connectDB = require('./config/db');
const corsOptions = require('./config/cors');
const { globalErrorHandler } = require('./middleware/errorMiddleware');

// ============================================
// Initialize Express App
// ============================================
const app = express();

// ============================================
// SECURITY MIDDLEWARE (Order matters!)
// ============================================

// 1. Helmet - Sets security HTTP headers
app.use(helmet());

// 2. CORS - Cross-origin resource sharing
app.use(cors(corsOptions));

// 3. Body parsing middleware
app.use(express.json({ limit: '10mb' }));        // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));   // Parse URL-encoded bodies

// 4. Cookie parser - For httpOnly cookie JWT tokens
app.use(cookieParser());

// 5. Mongo sanitize - Prevent NoSQL injection attacks
app.use(mongoSanitize());

// 6. XSS Sanitizer - Prevent cross-site scripting attacks (UPDATED)
app.use(xss());

// 7. HPP - Prevent HTTP Parameter Pollution
app.use(hpp());

// 8. Compression - Gzip compress responses
app.use(compression());

// ============================================
// LOGGING
// ============================================
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));  // Colored dev logging
} else {
    app.use(morgan('combined'));  // Apache-style production logging
}

// ============================================
// RATE LIMITING (Production security)
// ============================================
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 10000,                      // 100 requests per window
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    }
});

// Auth route rate limiter
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,      // ✅ 1 minute window (shorter)
    max: 10000,                       // ✅ Greatly increased for development
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    }
});
// ============================================
// STATIC FILES (for uploaded images)
// ============================================
app.use('/uploads', express.static('uploads'));

// ============================================
// API ROUTES
// ============================================

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Fahadé API is running smoothly',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use(globalErrorHandler);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

// Connect to DB first, then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`
        ╔══════════════════════════════════════╗
        ║     🏷️  FAHADÉ SERVER RUNNING       ║
        ║     Port: ${PORT}                     ║
        ║     Env: ${process.env.NODE_ENV}              ║
        ║     DB: Connected ✅                 ║
        ╚══════════════════════════════════════╝
        `);
    });
}).catch((err) => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});