/**
 * ============================================
 * FAHADÉ - Order Model
 * ============================================
 * Complete order schema with multiple items,
 * payment tracking, shipping info, status
 * management, and history logging.
 * ============================================
 */

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        // ========================================
        // ORDER IDENTIFICATION
        // ========================================
        orderNumber: {
            type: String,
            unique: true,
            // Generated automatically (e.g., "FH-2024-XXXXX")
        },

        // ========================================
        // CUSTOMER INFO
        // ========================================
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Snapshot of user details at time of order
        // (In case user changes their info later)
        customerInfo: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        },

        // ========================================
        // ORDER ITEMS
        // ========================================
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: { type: String, required: true },       // Snapshot
                image: { type: String, required: true },      // Snapshot
                price: { type: Number, required: true },      // Snapshot
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, 'Quantity must be at least 1'],
                },
                size: String,
                color: String,
                sku: String,
            }
        ],

        // ========================================
        // SHIPPING ADDRESS (Snapshot)
        // ========================================
        shippingAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, default: '' },       // ✅ NOT required
            postalCode: { type: String, default: '' },   // ✅ NOT required
            country: { type: String, default: 'Pakistan' },
        },

        // ========================================
        // PRICING BREAKDOWN
        // ========================================
        subtotal: {
            type: Number,
            required: true,
        },
        shippingCost: {
            type: Number,
            default: 0,
        },
        tax: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        couponCode: {
            type: String,
            default: null,
        },
        totalAmount: {
            type: Number,
            required: true,
        },

        // ========================================
        // PAYMENT INFO
        // ========================================
        paymentMethod: {
            type: String,
            enum: ['jazzcash', 'easypaisa', 'bank_transfer', 'cod'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentDetails: {
            transactionId: String,
            accountNumber: String,   // Last 4 digits only for security
            bankName: String,
            receiptImage: String,    // For bank transfer proof
            paidAt: Date,
        },

        // ========================================
        // ORDER STATUS
        // ========================================
        status: {
            type: String,
            enum: [
                'pending',         // Order placed, awaiting payment confirmation
                'confirmed',       // Payment confirmed, order being processed
                'processing',      // Order being prepared
                'shipped',         // Order dispatched
                'out_for_delivery', // Out for delivery
                'delivered',       // Order delivered
                'cancelled',       // Order cancelled
                'refunded',        // Order refunded
                'returned',        // Order returned by customer
            ],
            default: 'pending',
        },

        // Status history for tracking
        statusHistory: [
            {
                status: {
                    type: String,
                    required: true,
                },
                comment: String,
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            }
        ],

        // ========================================
        // SHIPPING / TRACKING
        // ========================================
        trackingNumber: String,
        courierCompany: String,
        estimatedDelivery: Date,
        deliveredAt: Date,

        // ========================================
        // NOTES
        // ========================================
        customerNotes: String,     // Notes from customer
        adminNotes: String,        // Internal admin notes

        // ========================================
        // CANCELLATION
        // ========================================
        cancellationReason: String,
        cancelledAt: Date,
    },
    {
        timestamps: true,
    }
);

// ============================================
// INDEXES
// ============================================
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });

// ============================================
// PRE-SAVE - Generate unique order number
// ============================================
OrderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 99999)
            .toString()
            .padStart(5, '0');
        this.orderNumber = `FH-${year}-${random}`;
    }

    // Add initial status to history
    if (this.isNew) {
        this.statusHistory.push({
            status: this.status,
            comment: 'Order placed successfully',
            timestamp: new Date(),
        });
    }

    next();
});

module.exports = mongoose.model('Order', OrderSchema);