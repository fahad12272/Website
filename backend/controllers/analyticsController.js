/**
 * ============================================
 * FAHADÉ - Analytics Controller
 * ============================================
 * Provides data for admin dashboard charts
 * and revenue tracking.
 * ============================================
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// GET DASHBOARD STATS
exports.getDashboardStats = async (req, res, next) => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Total revenue (all time)
        const totalRevenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // Monthly revenue
        const monthlyRevenueResult = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    status: { $ne: 'cancelled' },
                    createdAt: { $gte: firstDayOfMonth },
                },
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

        // Order counts
        const totalOrders = await Order.countDocuments();
        const monthlyOrders = await Order.countDocuments({ createdAt: { $gte: firstDayOfMonth } });
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        // User counts
        const totalUsers = await User.countDocuments({ role: 'user' });
        const newUsersThisMonth = await User.countDocuments({
            role: 'user',
            createdAt: { $gte: firstDayOfMonth },
        });

        // Product counts
        const totalProducts = await Product.countDocuments({ status: 'active' });
        const lowStockProducts = await Product.countDocuments({
            status: 'active',
            totalStock: { $lte: 5 },
        });

        // Revenue chart data (last 30 days)
        const revenueChart = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    status: { $ne: 'cancelled' },
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Top selling products
        const topProducts = await Product.find({ status: 'active' })
            .sort({ purchaseCount: -1 })
            .limit(5)
            .select('name price images purchaseCount');

        // Order status distribution
        const orderStatusDist = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        // Payment method distribution
        const paymentMethodDist = await Order.aggregate([
            { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
        ]);

        // Category performance
        const categoryPerformance = await Order.aggregate([
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productInfo',
                },
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$productInfo.category',
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    orders: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryInfo',
                },
            },
            { $unwind: '$categoryInfo' },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
        ]);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    monthlyRevenue,
                    totalOrders,
                    monthlyOrders,
                    pendingOrders,
                    totalUsers,
                    newUsersThisMonth,
                    totalProducts,
                    lowStockProducts,
                },
                revenueChart,
                topProducts,
                orderStatusDist,
                paymentMethodDist,
                categoryPerformance,
            },
        });

    } catch (error) {
        next(error);
    }
};

// GET SALES REPORT
exports.getSalesReport = async (req, res, next) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const matchFilter = { paymentStatus: 'paid', status: { $ne: 'cancelled' } };
        if (startDate && endDate) {
            matchFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

        const report = await Order.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalAmount' },
                    itemsSold: { $sum: { $size: '$items' } },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.status(200).json({
            success: true,
            data: report,
        });

    } catch (error) {
        next(error);
    }
};