/**
 * ============================================
 * FAHADÉ - Product Model
 * ============================================
 * Complete product schema designed for a luxury
 * eCommerce platform. Supports variants (sizes,
 * colors), images, inventory tracking, flash sales,
 * and SEO optimization.
 * ============================================
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema(
    {
        // ========================================
        // BASIC PRODUCT INFO
        // ========================================
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [200, 'Product name cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            trim: true,
            maxlength: [5000, 'Description cannot exceed 5000 characters'],
        },
        shortDescription: {
            type: String,
            trim: true,
            maxlength: [300, 'Short description cannot exceed 300 characters'],
        },

        // ========================================
        // PRICING
        // ========================================
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        compareAtPrice: {
            // Original/MRP price for showing discounts
            type: Number,
            min: [0, 'Compare price cannot be negative'],
        },
        costPrice: {
            // Internal cost for profit calculations
            type: Number,
            min: [0],
            select: false, // Hidden from public API
        },
        currency: {
            type: String,
            default: 'PKR',
            enum: ['PKR', 'USD'],
        },

        // ========================================
        // CATEGORY & BRAND
        // ========================================
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        brand: {
            type: String,
            trim: true,
            default: 'Fahadé',
        },
        // Supplier who added this product
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        tags: [String],

        // ========================================
        // PRODUCT VARIANTS (Sizes, Colors)
        // ========================================
        variants: [
            {
                size: {
                    type: String,
                    trim: true,
                    // e.g., "S", "M", "L", "XL", "42", "44"
                },
                color: {
                    name: String,      // e.g., "Midnight Black"
                    hex: String,       // e.g., "#000000"
                },
                sku: {
                    type: String,
                    trim: true,
                },
                price: {
                    // Override main price if variant has different price
                    type: Number,
                    min: [0],
                },
                stock: {
                    type: Number,
                    required: true,
                    min: [0, 'Stock cannot be negative'],
                    default: 0,
                },
                isActive: {
                    type: Boolean,
                    default: true,
                },
            }
        ],

        // ========================================
        // IMAGES
        // ========================================
        images: [
            {
                url: {
                    type: String,
                    required: true,
                },
                alt: String,
                isPrimary: {
                    type: Boolean,
                    default: false,
                },
                sortOrder: {
                    type: Number,
                    default: 0,
                },
            }
        ],

        // ========================================
        // INVENTORY MANAGEMENT
        // ========================================
        totalStock: {
            type: Number,
            default: 0,
            min: [0],
        },
        lowStockThreshold: {
            // Alert when stock falls below this
            type: Number,
            default: 5,
        },
        trackInventory: {
            type: Boolean,
            default: true,
        },
        allowBackorders: {
            // Allow purchase when out of stock
            type: Boolean,
            default: false,
        },

        // ========================================
        // FLASH SALE
        // ========================================
        flashSale: {
            isActive: {
                type: Boolean,
                default: false,
            },
            salePrice: {
                type: Number,
                min: [0],
            },
            startDate: Date,
            endDate: Date,
            maxQuantityPerUser: {
                type: Number,
                default: 1,
            },
        },

        // ========================================
        // PRODUCT STATUS & VISIBILITY
        // ========================================
        status: {
            type: String,
            enum: ['draft', 'active', 'inactive', 'out_of_stock'],
            default: 'draft',
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isTrending: {
            type: Boolean,
            default: false,
        },
        isNewArrival: {
            type: Boolean,
            default: false,
        },

        // ========================================
        // PRODUCT SPECIFICATIONS
        // ========================================
        specifications: [
            {
                label: String,   // e.g., "Material"
                value: String,   // e.g., "100% Cotton"
            }
        ],

        // ========================================
        // SHIPPING INFO
        // ========================================
        weight: Number,          // in grams
        dimensions: {
            length: Number,      // in cm
            width: Number,
            height: Number,
        },
        shippingClass: {
            type: String,
            enum: ['standard', 'express', 'heavy'],
            default: 'standard',
        },
        freeShipping: {
            type: Boolean,
            default: false,
        },

        // ========================================
        // ANALYTICS / POPULARITY TRACKING
        // ========================================
        viewCount: {
            type: Number,
            default: 0,
        },
        purchaseCount: {
            type: Number,
            default: 0,
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },

        // ========================================
        // SEO
        // ========================================
        metaTitle: String,
        metaDescription: String,
        metaKeywords: [String],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ============================================
// INDEXES (Critical for query performance)
// ============================================
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isTrending: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ 'flashSale.isActive': 1, 'flashSale.startDate': 1, 'flashSale.endDate': 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Full-text search

// ============================================
// VIRTUAL - Calculate discount percentage
// ============================================
ProductSchema.virtual('discountPercentage').get(function () {
    if (this.compareAtPrice && this.compareAtPrice > this.price) {
        return Math.round(
            ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100
        );
    }
    return 0;
});

// ============================================
// VIRTUAL - Check if flash sale is currently active
// ============================================
ProductSchema.virtual('isFlashSaleActive').get(function () {
    if (!this.flashSale.isActive) return false;
    const now = new Date();
    return (
        this.flashSale.startDate <= now &&
        this.flashSale.endDate >= now
    );
});

// ============================================
// VIRTUAL - Get effective price (considers flash sale)
// ============================================
ProductSchema.virtual('effectivePrice').get(function () {
    if (this.isFlashSaleActive && this.flashSale.salePrice) {
        return this.flashSale.salePrice;
    }
    return this.price;
});

// ============================================
// PRE-SAVE - Auto-generate slug
// ============================================
ProductSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
        }) + '-' + Date.now().toString(36); // Add unique suffix
    }
    next();
});

module.exports = mongoose.model('Product', ProductSchema);