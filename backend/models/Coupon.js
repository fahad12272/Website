/**
 * ============================================
 * FAHADÉ - Coupon Model
 * ============================================
 * Flexible coupon/discount system supporting
 * percentage and fixed amount discounts,
 * usage limits, and date-based validity.
 * ============================================
 */

const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Coupon code is required'],
            unique: true,
            uppercase: true,
            trim: true,
            match: [/^[A-Z0-9]+$/, 'Coupon code must be alphanumeric'],
        },
        description: {
            type: String,
            trim: true,
        },

        // Discount type and value
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: [0],
        },
        // Maximum discount amount (for percentage coupons)
        maxDiscountAmount: {
            type: Number,
            default: null,
        },

        // Minimum order value to apply coupon
        minOrderValue: {
            type: Number,
            default: 0,
        },

        // Usage limits
        usageLimit: {
            type: Number,       // Total times coupon can be used
            default: null,      // null = unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        perUserLimit: {
            type: Number,       // Times a single user can use this coupon
            default: 1,
        },

        // Validity period
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },

        // Applicable categories/products
        applicableCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category',
            }
        ],
        applicableProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            }
        ],

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual: Check if coupon is currently valid
CouponSchema.virtual('isValid').get(function () {
    const now = new Date();
    return (
        this.isActive &&
        now >= this.startDate &&
        now <= this.endDate &&
        (this.usageLimit === null || this.usedCount < this.usageLimit)
    );
});

module.exports = mongoose.model('Coupon', CouponSchema);