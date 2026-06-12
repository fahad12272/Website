/**
 * ============================================
 * FAHADÉ - Admin Order Management (Premium Responsive)
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { FiShoppingCart, FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiDollarSign, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isAuthenticated && user) fetchOrders();
    }, [isAuthenticated, user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/orders');
            setOrders(res.data.data || []);
        } catch (err) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            setUpdating(orderId);
            await api.put(`/admin/orders/${orderId}/status`, { status: newStatus, comment: `Status updated to ${newStatus}` });
            toast.success('Order status updated!');
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const updatePayment = async (orderId, newStatus) => {
        try {
            setUpdating(orderId);
            await api.put(`/admin/orders/${orderId}/payment`, { paymentStatus: newStatus });
            toast.success('Payment status updated!');
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update payment');
        } finally {
            setUpdating(null);
        }
    };

    if (!isAuthenticated || !user) return <div className="text-center py-20 text-gray-400 text-sm">Verifying access...</div>;
    if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Loading orders...</div>;

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
        processing: 'bg-purple-100 text-purple-700 border-purple-200',
        shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        out_for_delivery: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        delivered: 'bg-green-100 text-green-700 border-green-200',
        cancelled: 'bg-red-100 text-red-700 border-red-200',
    };

    const paymentColors = {
        pending: 'bg-orange-100 text-orange-700 border-orange-200',
        paid: 'bg-green-100 text-green-700 border-green-200',
        failed: 'bg-red-100 text-red-700 border-red-200',
        refunded: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    // Filter orders
    const filteredOrders = orders
        .filter(o => filterStatus === 'all' || o.status === filterStatus)
        .filter(o => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                o.orderNumber?.toLowerCase().includes(q) ||
                o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
                o.customerInfo?.name?.toLowerCase().includes(q)
            );
        });

    // Stats
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const deliveredCount = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return (
        <div className="space-y-4 sm:space-y-6 w-full">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-display text-primary-950">Orders</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{orders.length} total orders</p>
            </div>

            {/* ✅ FIXED: Stats Cards - 1 col mobile, 3 desktop with proper padding */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiClock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">Pending</p>
                            <p className="text-lg sm:text-xl font-bold text-gray-900">{pendingCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiCheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">Delivered</p>
                            <p className="text-lg sm:text-xl font-bold text-gray-900">{deliveredCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiDollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">Revenue</p>
                            <p className="text-lg sm:text-xl font-bold text-gray-900">PKR {totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by order number or customer..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-900 bg-white"
                    />
                </div>

                {/* ✅ FIXED: Filter tabs with proper wrapping */}
                <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium rounded-md transition-colors ${
                                filterStatus === status
                                    ? 'bg-primary-950 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Content */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg py-16 sm:py-20 text-center">
                    <FiShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-200" />
                    <p className="text-base sm:text-lg font-medium text-gray-400">No orders found</p>
                    <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-sm mx-auto">
                        {filterStatus === 'all' 
                            ? 'Orders will appear here when customers place them' 
                            : `No ${filterStatus} orders at the moment`
                        }
                    </p>
                </div>
            ) : (
                <>
                    {/* ✅ DESKTOP TABLE */}
                    <div className="hidden lg:block bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Order #</th>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Customer</th>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Items</th>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Total</th>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Payment</th>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Status</th>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Method</th>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.map(order => (
                                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-4 text-sm font-semibold text-gray-900">{order.orderNumber}</td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-gray-900">{order.shippingAddress?.fullName || order.customerInfo?.name || 'N/A'}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">{order.shippingAddress?.phone || order.customerInfo?.email || ''}</p>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600">{order.items?.length || 0} items</td>
                                            <td className="px-5 py-4 text-sm font-semibold text-gray-900">PKR {order.totalAmount?.toLocaleString()}</td>
                                            <td className="px-5 py-4">
                                                <select
                                                    value={order.paymentStatus}
                                                    onChange={(e) => updatePayment(order._id, e.target.value)}
                                                    disabled={updating === order._id}
                                                    className={`text-[10px] font-semibold border rounded-md px-2.5 py-1 ${paymentColors[order.paymentStatus] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="failed">Failed</option>
                                                    <option value="refunded">Refunded</option>
                                                </select>
                                            </td>
                                            <td className="px-5 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order._id, e.target.value)}
                                                    disabled={updating === order._id}
                                                    className={`text-[10px] font-semibold border rounded-md px-2.5 py-1 ${statusColors[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="out_for_delivery">Out for Delivery</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-500 uppercase font-medium">{order.paymentMethod}</td>
                                            <td className="px-5 py-4 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ✅ MOBILE CARDS */}
                    <div className="lg:hidden space-y-3">
                        {filteredOrders.map(order => {
                            const StatusIcon = statusIcons[order.status] || FiClock;
                            return (
                                <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-4">
                                    {/* Order Header */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-md border ${statusColors[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {order.status?.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    {/* Customer & Amount */}
                                    <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{order.shippingAddress?.fullName || order.customerInfo?.name || 'N/A'}</p>
                                            <p className="text-[11px] text-gray-400">{order.items?.length || 0} items • {order.paymentMethod?.toUpperCase()}</p>
                                        </div>
                                        <p className="text-base font-bold text-gray-900">PKR {order.totalAmount?.toLocaleString()}</p>
                                    </div>

                                    {/* Status Dropdowns */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[9px] text-gray-400 uppercase font-medium block mb-1.5">Payment</label>
                                            <select
                                                value={order.paymentStatus}
                                                onChange={(e) => updatePayment(order._id, e.target.value)}
                                                disabled={updating === order._id}
                                                className={`w-full text-[11px] font-semibold border rounded-md px-2.5 py-2 bg-white ${paymentColors[order.paymentStatus] || 'border-gray-200'}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="failed">Failed</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-gray-400 uppercase font-medium block mb-1.5">Status</label>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                                disabled={updating === order._id}
                                                className="w-full text-[11px] font-semibold border border-gray-200 rounded-md px-2.5 py-2 bg-white"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="out_for_delivery">Out for Delivery</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminOrders;