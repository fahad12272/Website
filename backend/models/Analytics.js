/**
 * ============================================
 * FAHADÉ - Analytics Model
 * ============================================
 * Tracks daily metrics for the admin dashboard.
 * One document per day with aggregated data.
 * ============================================
 */

const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
            unique: true, // One analytics doc per day
        },
        // Revenue metrics
        totalRevenue: {
            type: Number,
            default: 0,
        },
        totalOrders: {
            type: Number,
            default: 0,
        },
        averageOrderValue: {
            type: Number,
            default: 0,
        },
        // Product metrics
        productsSold: {
            type: Number,
            default: 0,
        },
        topSellingProducts: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                quantity: Number,
                revenue: Number,
            }
        ],
        // User metrics
        newUsers: {
            type: Number,
            default: 0,
        },
        activeUsers: {
            type: Number,
            default: 0,
        },
        // Category performance
        categoryPerformance: [
            {
                category: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Category',
                },
                revenue: Number,
                orders: Number,
            }
        ],
        // Payment method breakdown
        paymentMethods: {
            jazzcash: { count: Number, amount: Number },
            easypaisa: { count: Number, amount: Number },
            bank_transfer: { count: Number, amount: Number },
            cod: { count: Number, amount: Number },
        },
        // Traffic/visitor data
        totalVisitors: {
            type: Number,
            default: 0,
        },
        conversionRate: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Analytics', AnalyticsSchema);