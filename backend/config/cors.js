/**
 * ============================================
 * FAHADÉ - CORS Configuration
 * ============================================
 * Configures Cross-Origin Resource Sharing
 * for secure frontend-backend communication.
 * ============================================
 */

const corsOptions = {
    // Only allow requests from our frontend
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.CLIENT_URL,           // Development frontend
            'https://fahade.com',             // Production domain
            'https://www.fahade.com',         // WWW variant
        ];

        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,     // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Cache-Control'
    ],
    maxAge: 86400,  // Preflight cache for 24 hours
};

module.exports = corsOptions;