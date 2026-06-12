/**
 * ============================================
 * FAHADÉ - Main App Component (FIXED Layout)
 * ============================================
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; // ✅ useLocation added
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import { loadUser } from './store/slices/authSlice';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBanners from './pages/admin/AdminBanners';

// Toast notification configuration
const toastConfig = {
    position: 'top-right',
    duration: 3000,
    style: {
        background: '#171717',
        color: '#fafafa',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
    },
};

function App() {
    const dispatch = useDispatch();
    const location = useLocation(); // ✅ Get current route location

    // ✅ FIXED: Use location.pathname instead of window.location
    const isAdminRoute = location.pathname.startsWith('/admin');

    const { isAuthenticated, user } = useSelector((state) => state.auth);

    // Load fresh user data from backend on every app start
    useEffect(() => {
        const token = localStorage.getItem('fahade_token');
        if (token) {
            dispatch(loadUser());
        }
    }, [dispatch]);

    return (
        <div className="min-h-screen flex flex-col font-body">
            {/* Toast Notifications */}
            <Toaster {...toastConfig} />

            {/* ✅ Navigation (Only show if NOT Admin Panel) */}
            {!isAdminRoute && <Navbar />}

            {/* Main Content */}
            <main className="flex-grow">
                <Routes>
                    {/* Customer Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductListing />} />
                    <Route path="/product/:slug" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/wishlist" element={<Wishlist />} />

                    {/* Admin/Supplier Routes (Protected) */}
                    <Route path="/admin" element={
                        isAuthenticated && (user?.role === 'admin' || user?.role === 'supplier')
                            ? <AdminLayout />
                            : <Navigate to="/login" replace />
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />      {/* ✅ NEW */}
                        <Route path="categories" element={<AdminCategories />} />  {/* ✅ NEW */}
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="banners" element={<AdminBanners />} />
                    </Route>
                </Routes>
            </main>

            {/* ✅ Footer (Only show if NOT Admin Panel) */}
            {!isAdminRoute && <Footer />}
        </div>
    );
}

export default App;