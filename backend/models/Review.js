/**
 * ============================================
 * FAHADÉ - Review Model
 * ============================================
 * Product review system with ratings,
 * verified purchase tracking, and moderation.
 * ============================================
 */

const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        title: {
            type: String,
            trim: true,
            maxlength: [100, 'Review title cannot exceed 100 characters'],
        },
        comment: {
            type: String,
            required: [true, 'Review comment is required'],
            trim: true,
            maxlength: [1000, 'Review cannot exceed 1000 characters'],
        },
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },
        // Admin moderation
        isApproved: {
            type: Boolean,
            default: true, // Auto-approve; set to false for manual moderation
        },
        helpfulCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure one review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);