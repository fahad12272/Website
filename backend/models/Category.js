/**
 * ============================================
 * FAHADÉ - Category Model
 * ============================================
 * Hierarchical category system that supports
 * parent-child relationships (e.g., Men > Shoes > Sneakers).
 * Includes slugs for SEO-friendly URLs.
 * ============================================
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [50, 'Category name cannot exceed 50 characters'],
            unique: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        image: {
            type: String,
            default: '',
        },
        // Parent category for subcategories
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },
        // Category level: 0 = main, 1 = sub, 2 = sub-sub
        level: {
            type: Number,
            default: 0,
        },
        // For sorting categories in admin
        sortOrder: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // SEO fields
        metaTitle: String,
        metaDescription: String,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ sortOrder: 1 });

// Auto-generate slug from name
CategorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Virtual: get subcategories
CategorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent',
});

// Virtual: get products in this category
CategorySchema.virtual('productCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category',
    count: true,
});

module.exports = mongoose.model('Category', CategorySchema);