/**
 * ============================================
 * FAHADÉ - Axios Configuration
 * ============================================
 * Centralized API client for all backend
 * requests. Handles auth tokens, errors,
 * and base URL automatically.
 * ============================================
 */

import axios from 'axios';

// Create Axios instance with base configuration
const api = axios.create({
    baseURL: '/api', // Proxied to localhost:5000 via vite.config.js
    timeout: 15000,  // 15 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Required for httpOnly cookies
});

// ============================================
// REQUEST INTERCEPTOR
//  * Attaches auth token to every request
//  * ============================================
api.interceptors.request.use(
    (config) => {
        // Token is automatically sent via httpOnly cookie
        // But we can also add it to headers as fallback
        const token = localStorage.getItem('fahade_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ============================================
// // RESPONSE INTERCEPTOR
//  * Handles global errors (expired token, etc.)
//  * ============================================
api.interceptors.response.use(
    (response) => {
        // Return successful response data
        return response;
    },
    (error) => {
        // Handle specific error cases
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('fahade_token');
                    localStorage.removeItem('fahade_user');
                    // Only redirect if not already on login page
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    console.error('Access denied. Admin privileges required.');
                    break;
                case 404:
                    console.error('Resource not found.');
                    break;
                case 500:
                    console.error('Server error. Please try again later.');
                    break;
                default:
                    break;
            }
        }
        return Promise.reject(error);
    }
);

export default api;