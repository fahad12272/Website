/**
 * ============================================
 * FAHADÉ - Cart Slice (Redux)
 * ============================================
 * Manages shopping cart state with localStorage
 * persistence (cart survives page refresh).
 * ============================================
 */

import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromStorage = () => {
    try {
        const saved = localStorage.getItem('fahade_cart');
        return saved ? JSON.parse(saved) : { items: [] };
    } catch {
        return { items: [] };
    }
};

const saveCartToStorage = (items) => {
    localStorage.setItem('fahade_cart', JSON.stringify({ items }));
};

const initialState = {
    items: loadCartFromStorage().items,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const { product, quantity = 1, size, color } = action.payload;
            // Check if item already in cart with same size/color
            const existingIndex = state.items.findIndex(
                (item) =>
                    item.product._id === product._id &&
                    item.size === size &&
                    item.color === color
            );

            if (existingIndex >= 0) {
                state.items[existingIndex].quantity += quantity;
            } else {
                state.items.push({ product, quantity, size, color });
            }
            saveCartToStorage(state.items);
        },
        removeFromCart: (state, action) => {
            const { productId, size, color } = action.payload;
            state.items = state.items.filter(
                (item) =>
                    !(item.product._id === productId &&
                      item.size === size &&
                      item.color === color)
            );
            saveCartToStorage(state.items);
        },
        updateQuantity: (state, action) => {
            const { productId, size, color, quantity } = action.payload;
            const item = state.items.find(
                (item) =>
                    item.product._id === productId &&
                    item.size === size &&
                    item.color === color
            );
            if (item) {
                item.quantity = Math.max(1, quantity);
            }
            saveCartToStorage(state.items);
        },
        clearCart: (state) => {
            state.items = [];
            saveCartToStorage(state.items);
        },
    },
});

// ============================================
// SELECTORS (For calculating totals)
// ============================================
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartSubtotal = (state) =>
    state.cart.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    );

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;