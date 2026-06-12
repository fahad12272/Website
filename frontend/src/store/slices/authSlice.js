/**
 * ============================================
 * FAHADÉ - Auth Slice (FULLY FIXED)
 * ============================================
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// ============================================
// ASYNC THUNKS
// ============================================

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            localStorage.removeItem('fahade_token');
            localStorage.removeItem('fahade_user');
            return rejectWithValue('Session expired');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch }) => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Even if API fails, clear local data
        }
        localStorage.removeItem('fahade_token');
        localStorage.removeItem('fahade_user');
        dispatch({ type: 'cart/clearCart' });
    }
);

export const toggleWishlist = createAsyncThunk(
    'auth/toggleWishlist',
    async (productId, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            if (!auth.isAuthenticated) {
                return rejectWithValue('Please login to add items to wishlist');
            }
            const response = await api.post('/auth/wishlist', { productId });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update wishlist');
        }
    }
);

export const deleteAccount = createAsyncThunk(
    'auth/deleteAccount',
    async (_, { dispatch }) => {
        try {
            await api.delete('/auth/delete-account');
        } catch (error) {
            // Continue even if API fails
        }
        localStorage.removeItem('fahade_token');
        localStorage.removeItem('fahade_user');
        dispatch({ type: 'cart/clearCart' });
    }
);

// ============================================
// HELPERS
// ============================================
const stringifyWishlist = (wishlist) => {
    if (!wishlist || !Array.isArray(wishlist)) return [];
    return wishlist.map(id => String(id));
};

// ✅ HELPER: Save user to LocalStorage
const saveUserToStorage = (user) => {
    if (user) {
        localStorage.setItem('fahade_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('fahade_user');
    }
};

// ============================================
// SLICE
// ============================================

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: JSON.parse(localStorage.getItem('fahade_user')) || null,
        token: localStorage.getItem('fahade_token') || null,
        isAuthenticated: !!localStorage.getItem('fahade_token'),
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = { ...action.payload.data.user, wishlist: stringifyWishlist(action.payload.data.user.wishlist) };
                state.token = action.payload.token;
                localStorage.setItem('fahade_token', action.payload.token);
                saveUserToStorage(state.user); // ✅ SYNC
            })
            .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Login
            .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = { ...action.payload.data.user, wishlist: stringifyWishlist(action.payload.data.user.wishlist) };
                state.token = action.payload.token;
                localStorage.setItem('fahade_token', action.payload.token);
                saveUserToStorage(state.user); // ✅ SYNC
            })
            .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Load User
            .addCase(loadUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = { ...action.payload.data, wishlist: stringifyWishlist(action.payload.data.wishlist) };
                saveUserToStorage(state.user); // ✅ SYNC
            })
            .addCase(loadUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                saveUserToStorage(null);
                localStorage.removeItem('fahade_token');
            })

            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
                state.loading = false;
                saveUserToStorage(null); // ✅ CLEAR
                localStorage.removeItem('fahade_token');
            })

            // ✅ FIXED: Wishlist Toggle with LocalStorage Sync
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                if (state.user) {
                    // Update wishlist from backend response
                    state.user.wishlist = stringifyWishlist(action.payload.data);
                    // ✅ CRITICAL: Update LocalStorage immediately!
                    saveUserToStorage(state.user);
                }
            })
            .addCase(toggleWishlist.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Delete Account
            .addCase(deleteAccount.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
                state.loading = false;
                saveUserToStorage(null); // ✅ CLEAR
                localStorage.removeItem('fahade_token');
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;