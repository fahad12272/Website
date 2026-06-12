/**
 * ============================================
 * FAHADÉ - Authentication Controller
 * ============================================
 * Handles all authentication operations:
 * - Register with email verification
 * - Login with JWT cookie
 * - Logout
 * - Email verification
 * - Forgot/Reset password
 * - Get/Update profile
 * ============================================
 */

const crypto = require('crypto');
const User = require('../models/User');
const { sendTokenResponse, clearTokenCookie } = require('../utils/tokenUtils');
const {
    sendVerificationEmail,
    sendPasswordResetEmail,
} = require('../utils/emailService');

// ============================================
// REGISTER - Create new account
// ============================================
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists.',
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            phone,
        });

        // Generate email verification token
        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Send verification email (non-blocking)
        sendVerificationEmail(email, name, verificationToken).catch((err) => {
            console.error('Email send error:', err.message);
        });

        // Send auth token response
        sendTokenResponse(user, 201, res);

    } catch (error) {
        next(error);
    }
};

// ============================================
// LOGIN - Authenticate user
// ============================================
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.',
            });
        }

        // Find user (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Contact support.',
            });
        }

        // Update login tracking
        user.lastLogin = new Date();
        user.loginCount += 1;
        await user.save({ validateBeforeSave: false });

        // Send token response
        sendTokenResponse(user, 200, res);

    } catch (error) {
        next(error);
    }
};

// ============================================
// LOGOUT - Clear auth cookie
// ============================================
exports.logout = async (req, res, next) => {
    try {
        clearTokenCookie(res);
        res.status(200).json({
            success: true,
            message: 'Logged out successfully.',
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// VERIFY EMAIL - Confirm email ownership
// ============================================
exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required.',
            });
        }

        // Hash the token to compare with stored hash
        const verificationToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with matching, non-expired token
        const user = await User.findOne({
            emailVerificationToken: verificationToken,
            emailVerificationExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token.',
            });
        }

        // Mark email as verified and clear token
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// RESEND VERIFICATION EMAIL
// ============================================
exports.resendVerification = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified.',
            });
        }

        // Generate new verification token
        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Send new verification email
        sendVerificationEmail(user.email, user.name, verificationToken).catch((err) => {
            console.error('Email send error:', err.message);
        });

        res.status(200).json({
            success: true,
            message: 'Verification email sent. Check your inbox.',
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// FORGOT PASSWORD - Send reset link
// ============================================
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Security: Don't reveal if email exists
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a reset link has been sent.',
            });
        }

        // Generate reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Send reset email
        sendPasswordResetEmail(user.email, user.name, resetToken).catch((err) => {
            console.error('Email send error:', err.message);
        });

        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a reset link has been sent.',
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// RESET PASSWORD - Set new password using token
// ============================================
exports.resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required.',
            });
        }

        // Hash token to compare
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token.',
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Send new auth token (auto-login after reset)
        sendTokenResponse(user, 200, res);

    } catch (error) {
        next(error);
    }
};

// ============================================
// GET CURRENT USER PROFILE
// ============================================
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('wishlist', 'name price images slug')
            .populate('recentlyViewed', 'name price images slug');

        res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// UPDATE PROFILE
// ============================================
exports.updateProfile = async (req, res, next) => {
    try {
        // Fields allowed to update
        const allowedFields = ['name', 'phone', 'gender', 'dateOfBirth'];
        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Handle avatar upload
        if (req.file) {
            updateData.avatar = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: user,
            message: 'Profile updated successfully.',
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// CHANGE PASSWORD (while logged in)
// ============================================
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required.',
            });
        }

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect.',
            });
        }

        // Set new password
        user.password = newPassword;
        await user.save();

        // Send new token
        sendTokenResponse(user, 200, res);

    } catch (error) {
        next(error);
    }
};

// ============================================
// ADD ADDRESS
// ============================================
exports.addAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        // If this is first address or marked as default, unset other defaults
        if (req.body.isDefault || user.addresses.length === 0) {
            user.addresses.forEach(addr => { addr.isDefault = false; });
            req.body.isDefault = true;
        }

        user.addresses.push(req.body);
        await user.save();

        res.status(201).json({
            success: true,
            data: user.addresses,
            message: 'Address added successfully.',
        });

    } catch (error) {
        next(error);
    }
};
// ============================================
// TOGGLE WISHLIST (FIXED)
// ============================================
exports.toggleWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        // ✅ FIXED: Convert ObjectId array to String array for accurate comparison
        const wishlistStringArray = user.wishlist.map(id => id.toString());
        const index = wishlistStringArray.indexOf(productId);

        if (index > -1) {
            // Product is IN wishlist -> REMOVE it
            user.wishlist.splice(index, 1);
        } else {
            // Product is NOT in wishlist -> ADD it
            user.wishlist.push(productId);
        }

        // ✅ CRITICAL: Save the updated user document to MongoDB
        await user.save();

        res.status(200).json({
            success: true,
            data: user.wishlist, // Return the updated wishlist array
        });

    } catch (error) {
        next(error);
    }
};
// ============================================
// DELETE ACCOUNT (Permanently delete from MongoDB)
// ============================================
exports.deleteAccount = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        // Clear cookie
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: 'Account deleted permanently.',
        });

    } catch (error) {
        next(error);
    }
};