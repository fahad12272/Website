/**
 * ============================================
 * FAHADÉ - User Model
 * ============================================
 * Complete user schema with authentication,
 * profile data, addresses, and security fields.
 * Supports both regular users and admins.
 * ============================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
    {
        // ========================================
        // BASIC INFO
        // ========================================
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email address'
            ],
        },
        phone: {
            type: String,
            trim: true,
            match: [/^[+]?[\d\s-]{7,15}$/, 'Please enter a valid phone number'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't include password in queries by default
        },

        // ========================================
        // PROFILE
        // ========================================
        avatar: {
            type: String,
            default: '',
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer-not-to-say'],
            default: 'prefer-not-to-say',
        },
        dateOfBirth: {
            type: Date,
        },

        // ========================================
        // ADDRESSES (Multiple shipping addresses)
        // ========================================
        addresses: [
            {
                label: {
                    type: String,
                    enum: ['home', 'office', 'other'],
                    default: 'home',
                },
                fullName: { type: String, required: true },
                phone: { type: String, required: true },
                street: { type: String, required: true },
                city: { type: String, required: true },
                state: { type: String, required: true },
                postalCode: { type: String, required: true },
                country: {
                    type: String,
                    default: 'Pakistan',
                },
                isDefault: {
                    type: Boolean,
                    default: false,
                },
            }
        ],

        // ========================================
        // AUTHENTICATION & SECURITY
        // ========================================
        role: {
            type: String,
            enum: ['user', 'admin', 'supplier'], // ✅ 'supplier' added
            default: 'user',
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },

        // Password reset fields
        resetPasswordToken: String,
        resetPasswordExpire: Date,

        // Email verification token
        emailVerificationToken: String,
        emailVerificationExpire: Date,

        // ========================================
        // USER ACTIVITY TRACKING
        // ========================================
        lastLogin: Date,
        loginCount: {
            type: Number,
            default: 0,
        },
        // Track viewed products for recommendations
        recentlyViewed: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            }
        ],
        // Wishlist
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            }
        ],
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ============================================
// INDEXES for performance
// ============================================
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// ============================================
// MIDDLEWARE - Hash password before saving
// ============================================
UserSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12); // High salt rounds for security
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// ============================================
// METHODS - Compare password for login
// ============================================
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// ============================================
// METHODS - Generate password reset token
// ============================================
UserSchema.methods.getResetPasswordToken = function () {
    // Generate random token using crypto
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set token expire time (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken; // Return unhashed token (sent to user via email)
};

// ============================================
// METHODS - Generate email verification token
// ============================================
UserSchema.methods.getEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return verificationToken;
};

// ============================================
// VIRTUAL - Get user's default address
// ============================================
UserSchema.virtual('defaultAddress').get(function () {
    return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
});

module.exports = mongoose.model('User', UserSchema);