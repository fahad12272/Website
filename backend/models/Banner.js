/**
 * ============================================
 * FAHADÉ - Banner Model
 * ============================================
 * Home page banner management with scheduling,
 * sorting, and click tracking.
 * ============================================
 */

const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Banner title is required'],
            trim: true,
        },
        subtitle: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Banner image is required'],
        },
        mobileImage: {
            // Separate mobile-optimized image
            type: String,
        },

        // CTA (Call to Action) button
        ctaText: {
            type: String,
            default: 'Shop Now',
        },
        ctaLink: {
            type: String,
            default: '',
        },

        // Banner position on page
        position: {
            type: String,
            enum: ['hero', 'top', 'middle', 'bottom', 'sidebar'],
            default: 'hero',
        },

        // Scheduling
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            default: null, // null = no end date
        },

        // Display settings
        sortOrder: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },

        // Analytics
        clickCount: {
            type: Number,
            default: 0,
        },
        impressionCount: {
            type: Number,
            default: 0,
        },

        // Text overlay position for different layouts
        textPosition: {
            type: String,
            enum: ['left', 'center', 'right'],
            default: 'center',
        },
        textColour: {
            type: String,
            default: '#ffffff',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Banner', BannerSchema);