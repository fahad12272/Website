/**
 * ============================================
 * FAHADÉ - Admin Controller
 * ============================================
 * Complete admin panel functionality for
 * managing products, orders, users, banners,
 * coupons, categories, and flash sales.
 * ============================================
 */

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

// ============================================
// PRODUCT MANAGEMENT (Admin)
// ============================================

// Create product
exports.createProduct = async (req, res, next) => {
    try {
        const productData = { ...req.body };

        // Parse variants from string to array
        if (productData.variants && typeof productData.variants === 'string') {
            try {
                productData.variants = JSON.parse(productData.variants);
            } catch (parseErr) {
                productData.variants = [];
            }
        }

        // ✅ CRITICAL FIX: Map uploaded files to the `images` array for MongoDB
        if (req.files && req.files.length > 0) {
            productData.images = req.files.map((file, index) => ({
                url: `/uploads/products/${file.filename}`, // Path that frontend can access
                alt: productData.name || 'Product Image',
                isPrimary: index === 0, // First image is primary
                sortOrder: index + 1,
            }));
        }

        productData.supplier = req.user.id;

        const product = await Product.create(productData);
        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully.',
        });
    } catch (error) {
        next(error);
    }
};

// Update product
exports.updateProduct = async (req, res, next) => {
    try {
        const productData = { ...req.body };

        // Parse variants
        if (productData.variants && typeof productData.variants === 'string') {
            try { productData.variants = JSON.parse(productData.variants); } catch { productData.variants = []; }
        }

        // ✅ CRITICAL FIX: Handle kept images (existing images to keep)
        let finalImages = [];

        // Step 1: Parse keptImages (existing images that weren't removed)
        if (productData.keptImages && typeof productData.keptImages === 'string') {
            try {
                finalImages = JSON.parse(productData.keptImages);
            } catch {
                finalImages = [];
            }
        }

        // Step 2: Add new uploaded images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map((file, index) => ({
                url: `/uploads/products/${file.filename}`,
                alt: productData.name || 'Product Image',
                isPrimary: finalImages.length === 0 && index === 0, // Primary if no existing images
                sortOrder: finalImages.length + index + 1,
            }));
            finalImages = [...finalImages, ...newImages];
        }

        // Step 3: Set final images array
        if (finalImages.length > 0) {
            productData.images = finalImages;
            // Ensure first image is primary
            productData.images[0].isPrimary = true;
        }

        // Remove keptImages from productData (it's not a MongoDB field)
        delete productData.keptImages;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            productData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        res.status(200).json({ success: true, data: product, message: 'Product updated.' });
    } catch (error) {
        next(error);
    }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }
        res.status(200).json({ success: true, message: 'Product deleted.' });
    } catch (error) {
        next(error);
    }
};

// Get all products (admin - includes drafts)
exports.adminGetProducts = async (req, res, next) => {
    try {
        const { page, limit, skip } = paginate(req.query);
        const filter = {};

        if (req.query.status) filter.status = req.query.status;
        if (req.query.category) filter.category = req.query.category;

        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

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
// ORDER MANAGEMENT (Admin)
// ============================================

// Get all orders
exports.adminGetOrders = async (req, res, next) => {
    try {
        const { page, limit, skip } = paginate(req.query);
        const filter = {};

        if (req.query.status) filter.status = req.query.status;
        if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            ...formatPaginationResponse(orders, total, page, limit),
        });
    } catch (error) {
        next(error);
    }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status, comment, trackingNumber, courierCompany } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Update fields
        if (status) order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (courierCompany) order.courierCompany = courierCompany;
        if (status === 'delivered') order.deliveredAt = new Date();

        // Add to status history
        order.statusHistory.push({
            status: status || order.status,
            comment: comment || '',
            updatedBy: req.user.id,
            timestamp: new Date(),
        });

        await order.save();

        res.status(200).json({
            success: true,
            data: order,
            message: 'Order status updated.',
        });
    } catch (error) {
        next(error);
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res, next) => {
    try {
        const { paymentStatus, transactionId } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        order.paymentStatus = paymentStatus;
        if (transactionId) order.paymentDetails.transactionId = transactionId;
        if (paymentStatus === 'paid') order.paymentDetails.paidAt = new Date();

        await order.save();

        res.status(200).json({
            success: true,
            data: order,
            message: 'Payment status updated.',
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// USER MANAGEMENT (Admin)
// ============================================

exports.adminGetUsers = async (req, res, next) => {
    try {
        const { page, limit, skip } = paginate(req.query);
        const filter = {};
        if (req.query.role) filter.role = req.query.role;
        if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

        const users = await User.find(filter)
            .select('-password -resetPasswordToken -emailVerificationToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            ...formatPaginationResponse(users, total, page, limit),
        });
    } catch (error) {
        next(error);
    }
};

exports.updateUserStatus = async (req, res, next) => {
    try {
        const { isActive, role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive, role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({ success: true, data: user, message: 'User updated.' });
    } catch (error) {
        next(error);
    }
};

// ============================================
// CATEGORY MANAGEMENT (Admin)
// ============================================

exports.createCategory = async (req, res, next) => {
    try {
        const categoryData = { ...req.body };
        
        // ✅ Save uploaded image path
        if (req.file) {
            categoryData.image = `/uploads/categories/${req.file.filename}`;
        }
        
        const category = await Category.create(categoryData);
        res.status(201).json({ success: true, data: category, message: 'Category created.' });
    } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const categoryData = { ...req.body };
        
        // ✅ If new image uploaded, update the path
        if (req.file) {
            categoryData.image = `/uploads/categories/${req.file.filename}`;
        }
        
        const category = await Category.findByIdAndUpdate(req.params.id, categoryData, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
        res.status(200).json({ success: true, data: category });
    } catch (error) { next(error); }
};
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
        res.status(200).json({ success: true, message: 'Category deleted.' });
    } catch (error) {
        next(error);
    }
};

exports.adminGetCategories = async (req, res, next) => {
    try {
        const categories = await Category.find()
            .populate('parent', 'name')
            .sort({ sortOrder: 1, name: 1 });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

// ============================================
// COUPON MANAGEMENT (Admin)
// ============================================

exports.createCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, data: coupon, message: 'Coupon created.' });
    } catch (error) {
        next(error);
    }
};

exports.updateCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
        res.status(200).json({ success: true, data: coupon });
    } catch (error) {
        next(error);
    }
};

exports.deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
        res.status(200).json({ success: true, message: 'Coupon deleted.' });
    } catch (error) {
        next(error);
    }
};

exports.adminGetCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: coupons });
    } catch (error) {
        next(error);
    }
};

// ============================================
// BANNER MANAGEMENT (Admin)
// ============================================

exports.createBanner = async (req, res, next) => {
    try {
        const bannerData = { ...req.body };

        // Save uploaded banner image
        if (req.file) {
            bannerData.image = `/uploads/banners/${req.file.filename}`;
        }

        const banner = await Banner.create(bannerData);

        res.status(201).json({
            success: true,
            data: banner,
            message: 'Banner created successfully.',
        });
    } catch (error) {
        next(error);
    }
};

exports.updateBanner = async (req, res, next) => {
    try {
        const bannerData = { ...req.body };

        // Update image if new image uploaded
        if (req.file) {
            bannerData.image = `/uploads/banners/${req.file.filename}`;
        }

        const banner = await Banner.findByIdAndUpdate(
            req.params.id,
            bannerData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: banner,
            message: 'Banner updated successfully.',
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found.' });
        res.status(200).json({ success: true, message: 'Banner deleted.' });
    } catch (error) {
        next(error);
    }
};

exports.adminGetBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 });
        res.status(200).json({ success: true, data: banners });
    } catch (error) {
        next(error);
    }
};

// ============================================
// FLASH SALE MANAGEMENT (Admin)
// ============================================

exports.manageFlashSale = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive, salePrice, startDate, endDate, maxQuantityPerUser } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        product.flashSale = {
            isActive: isActive !== undefined ? isActive : product.flashSale.isActive,
            salePrice: salePrice || product.flashSale.salePrice,
            startDate: startDate || product.flashSale.startDate,
            endDate: endDate || product.flashSale.endDate,
            maxQuantityPerUser: maxQuantityPerUser || product.flashSale.maxQuantityPerUser,
        };

        await product.save();

        res.status(200).json({
            success: true,
            data: product,
            message: 'Flash sale updated.',
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// INVENTORY MANAGEMENT (Admin)
// ============================================

exports.updateInventory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { totalStock, lowStockThreshold, trackInventory, allowBackorders, variants } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        if (totalStock !== undefined) product.totalStock = totalStock;
        if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;
        if (trackInventory !== undefined) product.trackInventory = trackInventory;
        if (allowBackorders !== undefined) product.allowBackorders = allowBackorders;
        if (variants) product.variants = variants;

        // Auto-update status based on stock
        if (product.totalStock === 0 && !product.allowBackorders) {
            product.status = 'out_of_stock';
        } else if (product.status === 'out_of_stock' && product.totalStock > 0) {
            product.status = 'active';
        }

        await product.save();

        res.status(200).json({
            success: true,
            data: product,
            message: 'Inventory updated.',
        });
    } catch (error) {
        next(error);
    }
};

// Get low stock alerts
exports.getLowStockAlerts = async (req, res, next) => {
    try {
        const products = await Product.find({
            status: 'active',
            trackInventory: true,
            $expr: { $lte: ['$totalStock', '$lowStockThreshold'] },
        }).select('name totalStock lowStockThreshold images sku');

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
};