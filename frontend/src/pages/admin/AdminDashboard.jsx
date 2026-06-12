/**
 * ============================================
 * FAHADÉ - Admin Dashboard (100% Responsive)
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FiPackage, FiShoppingCart, FiUsers, FiDollarSign, FiTrendingUp, FiAlertCircle, FiPlus, FiArrowRight, FiTag, FiImage } from 'react-icons/fi';

const AdminDashboard = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchStats();
            fetchRecentOrders();
        }
    }, [isAuthenticated, user]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/analytics/dashboard');
            setStats(res.data.data?.summary || res.data.data || stats);
        } catch (err) {
            console.error('Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            const orders = res.data.data || [];
            setRecentOrders(orders.slice(0, 5)); // Latest 5 orders
        } catch (err) {
            console.error('Failed to fetch orders');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="text-primary-400 text-sm">Loading dashboard...</div>
        </div>
    );

    const statCards = [
        { label: 'Products', value: stats.totalProducts || 0, icon: FiPackage, color: 'bg-blue-50 text-blue-600', link: '/admin/products' },
        { label: 'Orders', value: stats.totalOrders || 0, icon: FiShoppingCart, color: 'bg-green-50 text-green-600', link: '/admin/orders' },
        { label: 'Users', value: stats.totalUsers || 0, icon: FiUsers, color: 'bg-purple-50 text-purple-600', link: '/admin/users' },
        { label: 'Revenue', value: `PKR ${(stats.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: 'bg-amber-50 text-amber-600', link: '/admin/orders' },
    ];

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        processing: 'bg-purple-100 text-purple-700',
        shipped: 'bg-indigo-100 text-indigo-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-display text-primary-950">Dashboard</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Welcome back, {user?.name || 'Admin'}! 👋</p>
                </div>
                <Link 
                    to="/admin/products" 
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-950 text-white text-xs sm:text-sm font-medium tracking-wider uppercase hover:bg-accent transition-colors w-fit"
                >
                    <FiPlus className="w-4 h-4" /> Add Product
                </Link>
            </div>

            {/* Stat Cards - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {statCards.map((card) => (
                    <Link 
                        key={card.label} 
                        to={card.link}
                        className="bg-white rounded-lg p-3 sm:p-4 lg:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${card.color} flex items-center justify-center mb-2 sm:mb-3`}>
                            <card.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">{card.label}</p>
                        <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mt-0.5 sm:mt-1 truncate">{card.value}</p>
                    </Link>
                ))}
            </div>

            {/* Bottom Section - 2 Columns on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
                        <h2 className="text-sm sm:text-base font-display text-primary-950">Recent Orders</h2>
                        <Link to="/admin/orders" className="text-xs text-accent hover:underline flex items-center gap-1">
                            View All <FiArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    
                    {recentOrders.length === 0 ? (
                        <div className="p-6 sm:p-8 text-center text-gray-400 text-sm">
                            <FiShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            No orders yet
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-5 py-3 text-xs tracking-wider uppercase text-gray-500">Order</th>
                                            <th className="px-5 py-3 text-xs tracking-wider uppercase text-gray-500">Customer</th>
                                            <th className="px-5 py-3 text-xs tracking-wider uppercase text-gray-500">Total</th>
                                            <th className="px-5 py-3 text-xs tracking-wider uppercase text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50/50">
                                                <td className="px-5 py-3 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                                                <td className="px-5 py-3 text-sm text-gray-600">{order.shippingAddress?.fullName || 'N/A'}</td>
                                                <td className="px-5 py-3 text-sm font-medium text-gray-900">PKR {order.totalAmount?.toLocaleString()}</td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="sm:hidden divide-y divide-gray-100">
                                {recentOrders.map((order) => (
                                    <div key={order._id} className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{order.shippingAddress?.fullName || 'N/A'}</span>
                                            <span className="font-medium text-gray-900">PKR {order.totalAmount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="p-4 sm:p-5 border-b border-gray-100">
                        <h2 className="text-sm sm:text-base font-display text-primary-950">Quick Actions</h2>
                    </div>
                    <div className="p-4 sm:p-5 space-y-2 sm:space-y-3">
                        {[
                            { name: 'Add Product', icon: FiPackage, path: '/admin/products', desc: 'Add new items to store' },
                            { name: 'View Orders', icon: FiShoppingCart, path: '/admin/orders', desc: 'Check pending orders' },
                            { name: 'Manage Categories', icon: FiTag, path: '/admin/categories', desc: 'Organize your catalog' },
                            { name: 'Upload Banner', icon: FiImage, path: '/admin/banners', desc: 'Update home page' },
                        ].map((action) => (
                            <Link 
                                key={action.name}
                                to={action.path} 
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                                    <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{action.name}</p>
                                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">{action.desc}</p>
                                </div>
                                <FiArrowRight className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;