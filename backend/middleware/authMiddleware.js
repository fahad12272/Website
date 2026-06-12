/**
 * ============================================
 * FAHADÉ - Authentication Middleware
 * ============================================
 * Protects routes by verifying JWT tokens
 * from httpOnly cookies. Also supports
 * Authorization header as fallback.
 * ============================================
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect - Verifies user is authenticated
 * Extracts JWT from httpOnly cookie or Authorization header,
 * verifies it, and attaches user to request object.
 */
const protect = async (req, res, next) => {
    let token;

    try {
        // Priority 1: Check httpOnly cookie (most secure)
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Priority 2: Check Authorization header (for API clients)
        else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        // No token found
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.',
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID from token payload
        // .select('-password') excludes the password hash
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.',
            });
        }

        // Check if user account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Contact support.',
            });
        }

        // Attach user to request for use in controllers
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.',
            });
        }
        next(error);
    }
};

/**
 * optionalAuth - Attaches user if token exists,
 * but doesn't block unauthenticated requests.
 * Useful for product pages where logged-in users
 * see personalized content but anyone can browse.
 */
const optionalAuth = async (req, res, next) => {
    let token;

    try {
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user && user.isActive) {
                req.user = user;
            }
        }
    } catch (error) {
        // Silently fail for optional auth
    }

    next();
};

module.exports = { protect, optionalAuth };