/**
 * ============================================
 * FAHADÉ - Admin & Supplier Middleware
 * ============================================
 */

/**
 * admin - Strictly for Admin users only
 */
const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Please login first.',
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
    }

    next();
};

/**
 * adminOrSupplier - Allows access to Admins and Suppliers
 * Suppliers can manage products, other routes are admin-only.
 */
const adminOrSupplier = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Please login first.',
        });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'supplier') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin or Supplier privileges required.',
        });
    }

    next();
};

// ✅ Export both functions in a single object at the bottom
module.exports = { admin, adminOrSupplier };