/**
 * ============================================
 * FAHADÉ - Product Controller
 * ============================================
 * Handles all product-related operations:
 * - CRUD with advanced filtering
 * - Search, sort, pagination
 * - Flash sale management
 * - Smart recommendations
 * ============================================
 */

const Product = require('../models/Product');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { paginate, formatPaginationResponse, isFlashSaleActive } = require('../utils/helpers');

// ============================================
// GET ALL PRODUCTS - With filtering, sorting, search
// ============================================
exports.getProducts = async (req, res, next) => {
    try {
        const { page, limit, skip } = paginate(req.query);

        // ========================================
        // BUILD FILTER QUERY
        // ========================================
        const filter = { status: 'active' };

        // Filter by category
        if (req.query.category) {
            // Search category by slug only (to avoid CastError)
            const category = await Category.findOne({
                slug: req.query.category
            });

            if (category) {
                filter.category = category._id; // Use the found category's ObjectId
            } else {
                // If category slug not found, return no products
                filter.category = 'non-existent-id';
            }
        }

        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        // Filter by featured/trending/new
        if (req.query.featured === 'true') filter.isFeatured = true;
        if (req.query.trending === 'true') filter.isTrending = true;
        if (req.query.newArrival === 'true') filter.isNewArrival = true;

        // Filter by flash sale
        if (req.query.flashSale === 'true') {
            filter['flashSale.isActive'] = true;
            filter['flashSale.startDate'] = { $lte: new Date() };
            filter['flashSale.endDate'] = { $gte: new Date() };
        }

        // Filter by brand
        if (req.query.brand) {
            filter.brand = { $regex: req.query.brand, $options: 'i' };
        }

        // Filter by size (in variants)
        if (req.query.size) {
            filter['variants.size'] = req.query.size;
        }

        // ========================================
        // BUILD SORT
        // ========================================
        let sort = {};
        switch (req.query.sort) {
            case 'price_asc':
                sort = { price: 1 };
                break;
            case 'price_desc':
                sort = { price: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'popular':
                sort = { viewCount: -1 };
                break;
            case 'top_rated':
                sort = { averageRating: -1 };
                break;
            case 'best_selling':
                sort = { purchaseCount: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }

        // ========================================
        // SEARCH (Full-text search)
        // ========================================
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
            // For text search, use text score for sorting
            sort = { score: { $meta: 'textScore' } };
        }

        // ========================================
        // EXECUTE QUERY
        // ========================================
        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-costPrice -specifications -metaTitle -metaDescription -metaKeywords');

        // Get total count for pagination
        const total = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            ...formatPaginationResponse(products, total, page, limit),
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// GET SINGLE PRODUCT - By slug or ID
// ============================================
exports.getProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;

        // Build query safely to avoid CastError
        let query = { status: 'active' };

        if (mongoose.Types.ObjectId.isValid(slug)) {
            // If it's a valid MongoDB ID, search by both ID and slug
            query.$or = [{ _id: slug }, { slug: slug }];
        } else {
            // If it's not a valid ID (like "fhade-classic-black-hoodie"), only search by slug
            query.slug = slug;
        }

        let product = await Product.findOne(query)
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }

        // Increment view count
        product.viewCount += 1;
        await product.save({ validateBeforeSave: false });

        // Get product reviews
        const reviews = await Review.find({ product: product._id, isApproved: true })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(20);

        // Check flash sale status
        const flashSaleActive = isFlashSaleActive(product.flashSale);

        res.status(200).json({
            success: true,
            data: {
                ...product.toObject(),
                isFlashSaleActive: flashSaleActive,
                effectivePrice: flashSaleActive && product.flashSale.salePrice
                    ? product.flashSale.salePrice
                    : product.price,
            },
            reviews,
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// GET FLASH SALE PRODUCTS
// ============================================
exports.getFlashSaleProducts = async (req, res, next) => {
    try {
        const now = new Date();

        const products = await Product.find({
            status: 'active',
            'flashSale.isActive': true,
            'flashSale.startDate': { $lte: now },
            'flashSale.endDate': { $gte: now },
        })
            .select('name slug price compareAtPrice images flashSale brand')
            .limit(20);

        res.status(200).json({
            success: true,
            data: products,
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// GET TRENDING PRODUCTS
// ============================================
exports.getTrendingProducts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Trending = high view count + purchase count + marked as trending
        const products = await Product.find({
            status: 'active',
            $or: [
                { isTrending: true },
                { purchaseCount: { $gt: 10 } },
            ],
        })
            .sort({ purchaseCount: -1, viewCount: -1 })
            .select('name slug price compareAtPrice images brand averageRating')
            .limit(limit);

        res.status(200).json({
            success: true,
            data: products,
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// SMART RECOMMENDATIONS - "You may also like"
// Based on: same category, similar price range, trending
// ============================================
exports.getRecommendations = async (req, res, next) => {
    try {
        const { productId, categoryId } = req.query;
        const limit = parseInt(req.query.limit) || 8;

        let products = [];

        // If we have a product ID, find similar products
        if (productId) {
            const sourceProduct = await Product.findById(productId);
            if (sourceProduct) {
                // Find products in the same category with similar price
                const priceRange = sourceProduct.price * 0.5; // ±50% price range
                products = await Product.find({
                    _id: { $ne: productId },
                    status: 'active',
                    category: sourceProduct.category,
                    price: {
                        $gte: sourceProduct.price - priceRange,
                        $lte: sourceProduct.price + priceRange,
                    },
                })
                    .sort({ purchaseCount: -1, averageRating: -1 })
                    .limit(limit);
            }
        }

        // If not enough from category, fill with trending
        if (products.length < limit) {
            const remaining = limit - products.length;
            const excludeIds = products.map(p => p._id);
            if (productId) excludeIds.push(productId);

            const trendingProducts = await Product.find({
                _id: { $nin: excludeIds },
                status: 'active',
                isTrending: true,
            })
                .sort({ purchaseCount: -1 })
                .limit(remaining);

            products = [...products, ...trendingProducts];
        }

        res.status(200).json({
            success: true,
            data: products,
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// SEARCH PRODUCTS (Autocomplete/Suggestions)
// ============================================
exports.searchProducts = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(200).json({
                success: true,
                data: [],
            });
        }

        const products = await Product.find({
            status: 'active',
            $text: { $search: q },
        })
            .select('name slug price images brand')
            .sort({ score: { $meta: 'textScore' } })
            .limit(10);

        res.status(200).json({
            success: true,
            data: products,
        });

    } catch (error) {
        next(error);
    }
};