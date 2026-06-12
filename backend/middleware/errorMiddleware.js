/**
 * ============================================
 * FAHADÉ - Global Error Handler Middleware
 * ============================================
 * Centralized error handling for the entire app.
 * Catches all errors and returns consistent
 * JSON error responses. Also handles specific
 * MongoDB and JWT errors.
 * ============================================
 */

/**
 * globalErrorHandler - Catches all errors
 * Must have 4 parameters for Express to recognize it as error middleware.
 */
const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log for development debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('🔴 Error:', err);
    }

    // ========================================
    // MongoDB Duplicate Key Error (code 11000)
    // ========================================
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        error.message = `Duplicate value for ${field}: "${value}". This ${field} already exists.`;
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    // ========================================
    // MongoDB Validation Error
    // ========================================
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        error.message = messages.join('. ');
        return res.status(400).json({
            success: false,
            message: error.message,
            errors: messages,
        });
    }

    // ========================================
    // MongoDB CastError (Invalid ObjectId)
    // ========================================
    if (err.name === 'CastError') {
        error.message = `Invalid ${err.path}: ${err.value}`;
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    // ========================================
    // JWT Errors
    // ========================================
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token. Please login again.',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired. Please login again.',
        });
    }

    // ========================================
    // Multer File Upload Error
    // ========================================
    if (err.name === 'MulterError') {
        let message = 'File upload error';
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size too large. Maximum 5MB allowed.';
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Too many files uploaded.';
        }
        return res.status(400).json({
            success: false,
            message,
        });
    }

    // ========================================
    // Default Server Error
    // ========================================
    return res.status(err.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        // Only show stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * notFound - Handles 404 errors for undefined routes
 */
const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { globalErrorHandler, notFound };