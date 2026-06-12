/**
 * ============================================
 * FAHADÉ - Category Controller (Public)
 * ============================================
 * Handles public category fetching for
 * navigation menus and product listing pages.
 * ============================================
 */

const Category = require('../models/Category');

/**
 * GET ALL ACTIVE CATEGORIES
 * Used for navigation menu and home page
 */
exports.getCategories = async (req, res, next) => {
    try {
        // Only fetch active categories, sorted by sortOrder
        const categories = await Category.find({ isActive: true })
            .populate('subcategories') // Populate child categories
            .sort({ sortOrder: 1, name: 1 })
            .select('-metaTitle -metaDescription -__v');

        res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET SINGLE CATEGORY BY SLUG
 * Used for category landing pages
 */
exports.getCategoryBySlug = async (req, res, next) => {
    try {
        const category = await Category.findOne({
            slug: req.params.slug,
            isActive: true,
        }).populate('subcategories');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
};