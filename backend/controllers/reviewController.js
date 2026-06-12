/**
 * ============================================
 * FAHADÉ - Review Controller
 * ============================================
 */

const Review = require('../models/Review');
const Product = require('../models/Product');

// CREATE REVIEW
exports.createReview = async (req, res, next) => {
    try {
        const { product, rating, title, comment } = req.body;

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            product,
            user: req.user.id,
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product.',
            });
        }

        // Check if user purchased this product (verified purchase)
        const Order = require('../models/Order');
        const hasPurchased = await Order.exists({
            user: req.user.id,
            'items.product': product,
            status: 'delivered',
        });

        const review = await Review.create({
            product,
            user: req.user.id,
            rating,
            title,
            comment,
            isVerifiedPurchase: !!hasPurchased,
        });

        // Update product average rating
        const stats = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(product) } },
            {
                $group: {
                    _id: '$product',
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 },
                },
            },
        ]);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(product, {
                averageRating: Math.round(stats[0].averageRating * 10) / 10,
                reviewCount: stats[0].reviewCount,
            });
        }

        res.status(201).json({
            success: true,
            data: review,
            message: 'Review submitted successfully.',
        });

    } catch (error) {
        next(error);
    }
};

// GET PRODUCT REVIEWS
exports.getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({
            product: req.params.productId,
            isApproved: true,
        })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: reviews,
        });

    } catch (error) {
        next(error);
    }
};