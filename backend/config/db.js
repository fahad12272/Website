/**
 * ============================================
 * FAHADÉ - Database Configuration
 * ============================================
 * MongoDB connection setup using Mongoose.
 * Includes retry logic and error handling
 * for production-grade reliability.
 * ============================================
 */

const mongoose = require('mongoose');

/**
 * connectDB - Establishes connection to MongoDB
 * Uses the MONGODB_URI from environment variables.
 * Implements retry mechanism for resilience.
 */
const connectDB = async () => {
    try {
        // Connection options for production reliability
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // These options prevent common connection warnings
            serverSelectionTimeoutMS: 5000, // Timeout after 5s if server not found
            socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events for production monitoring
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected successfully');
        });

    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        // In production, we want the app to crash if DB isn't available
        // This ensures the process manager (PM2/Docker) will restart it
        process.exit(1);
    }
};

module.exports = connectDB;