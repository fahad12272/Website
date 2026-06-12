/**
 * ============================================
 * FAHADÉ - Redux Store Configuration
 * ============================================
 */

import { configureStore } from '@reduxjs/toolkit'; // ✅ YEH LINE MISS HO GAYI THI
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import categoryReducer from './slices/categorySlice';
import uiReducer from './slices/uiSlice';
import orderReducer from './slices/orderSlice'; // ✅ NEW
import bannerReducer from './slices/bannerSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
        cart: cartReducer,
        categories: categoryReducer,
        banners: bannerReducer,
        ui: uiReducer,
        order: orderReducer, // ✅ NEW
    },
    // DevTools enabled in development only
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;