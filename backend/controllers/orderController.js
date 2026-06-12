/**
 * ============================================
 * FAHADÉ - Order Controller
 * ============================================
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { calculateCartTotals } = require('../utils/helpers');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// CREATE ORDER
exports.createOrder = async (req, res, next) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            couponCode,
            customerNotes,
        } = req.body;

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item.',
            });
        }

        // Validate products exist and get current prices
        const productIds = items.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });

        if (products.length !== productIds.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more products not found.',
            });
        }

        // Build order items with current prices (prevent price manipulation)
        const orderItems = items.map(item => {
            const product = products.find(p => p._id.toString() === item.product);
            return {
                product: item.product,
                name: product.name,
                image: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url || '',
                price: product.price,  // Use server-side price, NOT client price
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                sku: item.sku,
            };
        });

        // Calculate totals
        const coupon = couponCode ? await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true }) : null;
        const totals = calculateCartTotals(orderItems, coupon);

        // Validate coupon usage
        if (coupon) {
            if (!coupon.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'This coupon is no longer valid.',
                });
            }
            if (totals.subtotal < coupon.minOrderValue) {
                return res.status(400).json({
                    success: false,
                    message: `Minimum order value of PKR ${coupon.minOrderValue} required for this coupon.`,
                });
            }
            // Check user usage limit
            const userUsage = await Order.countDocuments({
                user: req.user.id,
                couponCode: coupon.code,
            });
            if (userUsage >= coupon.perUserLimit) {
                return res.status(400).json({
                    success: false,
                    message: 'You have reached the usage limit for this coupon.',
                });
            }
            // Increment coupon usage
            coupon.usedCount += 1;
            await coupon.save();
        }

        // Check inventory and decrement stock
        for (const item of items) {
            const product = products.find(p => p._id.toString() === item.product);
            if (product.trackInventory) {
                // Check variant stock
                if (item.size || item.color) {
                    const variant = product.variants.find(v =>
                        v.size === item.size &&
                        (!item.color || v.color?.name === item.color)
                    );
                    if (variant && variant.stock < item.quantity) {
                        return res.status(400).json({
                            success: false,
                            message: `Insufficient stock for ${product.name} (${item.size}). Available: ${variant.stock}`,
                        });
                    }
                    if (variant) {
                        variant.stock -= item.quantity;
                    }
                } else {
                    if (product.totalStock < item.quantity && !product.allowBackorders) {
                        return res.status(400).json({
                            success: false,
                            message: `Insufficient stock for ${product.name}. Available: ${product.totalStock}`,
                        });
                    }
                    product.totalStock -= item.quantity;
                }
                await product.save();
            }
        }

        // Create order
        const order = await Order.create({
            user: req.user.id,
            customerInfo: {
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone || shippingAddress.phone,
            },
            items: orderItems,
            shippingAddress,
            paymentMethod,
            subtotal: totals.subtotal,
            shippingCost: totals.shippingCost,
            tax: totals.tax,
            discount: totals.discount,
            couponCode: couponCode || null,
            totalAmount: totals.totalAmount,
            customerNotes,
        });

        // Update product purchase counts
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { purchaseCount: item.quantity },
            });
        }

        // Send order confirmation email (non-blocking)
        sendOrderConfirmationEmail(req.user.email, req.user.name, order).catch((err) => {
            console.error('Order email error:', err.message);
        });

        res.status(201).json({
            success: true,
            data: order,
            message: 'Order placed successfully!',
        });

    } catch (error) {
        next(error);
    }
};

// GET USER'S ORDERS
exports.getMyOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Order.countDocuments({ user: req.user.id });
        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-statusHistory -adminNotes');

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
            },
        });

    } catch (error) {
        next(error);
    }
};

// GET SINGLE ORDER
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });

    } catch (error) {
        next(error);
    }
};

// CANCEL ORDER
exports.cancelOrder = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        // Can only cancel pending/confirmed orders
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order with status: ${order.status}`,
            });
        }

        order.status = 'cancelled';
        order.cancellationReason = reason;
        order.cancelledAt = new Date();
        order.statusHistory.push({
            status: 'cancelled',
            comment: reason || 'Order cancelled by customer',
            timestamp: new Date(),
        });

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { totalStock: item.quantity },
            });
        }

        await order.save();

        res.status(200).json({
            success: true,
            data: order,
            message: 'Order cancelled successfully.',
        });

    } catch (error) {
        next(error);
    }
};