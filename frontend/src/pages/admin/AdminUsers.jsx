/**
 * ============================================
 * FAHADÉ - Admin User Management (100% Responsive)
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { FiUsers, FiUserCheck, FiUserX, FiUserPlus, FiSearch, FiEye, FiShield, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (isAuthenticated && currentUser) fetchUsers();
    }, [isAuthenticated, currentUser]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users');
            setUsers(res.data.data || []);
        } catch (err) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            setUpdating(userId);
            await api.put(`/admin/users/${userId}/status`, {
                isActive: !currentStatus
            });
            toast.success(currentStatus ? 'User blocked' : 'User activated');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    if (!isAuthenticated || !currentUser) {
        return <div className="text-center py-20 text-gray-400 text-sm">Verifying access...</div>;
    }

    if (loading) {
        return <div className="text-center py-20 text-gray-400 text-sm">Loading users...</div>;
    }

    // Stats
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const blockedUsers = users.filter(u => !u.isActive).length;
    const adminCount = users.filter(u => u.role === 'admin' || u.role === 'supplier').length;

    // Filtered users
    const filteredUsers = users
        .filter(u => filterRole === 'all' || u.role === filterRole)
        .filter(u => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.phone?.includes(q)
            );
        });

    const roleColors = {
        admin: 'bg-purple-100 text-purple-700 border-purple-200',
        supplier: 'bg-blue-100 text-blue-700 border-blue-200',
        user: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
        <div className="space-y-4 sm:space-y-6 w-full">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-display text-primary-950">Users</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{totalUsers} total users</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                            <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-medium">Total</p>
                            <p className="text-base sm:text-xl font-bold text-gray-900">{totalUsers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                            <FiUserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-medium">Active</p>
                            <p className="text-base sm:text-xl font-bold text-gray-900">{activeUsers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                            <FiUserX className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-medium">Blocked</p>
                            <p className="text-base sm:text-xl font-bold text-gray-900">{blockedUsers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                            <FiShield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-medium">Admins</p>
                            <p className="text-base sm:text-xl font-bold text-gray-900">{adminCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="space-y-3">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-900 bg-white"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['all', 'user', 'supplier', 'admin'].map(role => (
                        <button
                            key={role}
                            onClick={() => setFilterRole(role)}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium rounded-md transition-colors ${
                                filterRole === role
                                    ? 'bg-primary-950 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg py-16 sm:py-20 text-center">
                    <FiUsers className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-200" />
                    <p className="text-base sm:text-lg font-medium text-gray-400">No users found</p>
                    <p className="text-xs sm:text-sm text-gray-300 mt-2">Users will appear when they register</p>
                </div>
            ) : (
                <>
                    {/* DESKTOP TABLE */}
                    <div className="hidden lg:block bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">User</th>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Email</th>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Role</th>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Joined</th>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Status</th>
                                        <th className="px-5 py-3.5 text-[10px] tracking-wider uppercase text-gray-500 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map(u => (
                                        <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm shrink-0">
                                                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                                        <p className="text-[11px] text-gray-400">{u.phone || 'No phone'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600">{u.email}</td>
                                            <td className="px-5 py-4">
                                                <span className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${roleColors[u.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="px-5 py-4">
                                                <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${
                                                    u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {u.isActive ? 'Active' : 'Blocked'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedUser(u)}
                                                        className="p-1.5 text-gray-400 hover:text-primary-900 hover:bg-gray-100 rounded transition-colors"
                                                        title="View Details"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    {u._id !== currentUser.id && (
                                                        <button
                                                            onClick={() => toggleUserStatus(u._id, u.isActive)}
                                                            disabled={updating === u._id}
                                                            className={`px-3 py-1.5 text-[10px] font-medium rounded transition-colors ${
                                                                u.isActive
                                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                            }`}
                                                        >
                                                            {updating === u._id ? '...' : u.isActive ? 'Block' : 'Unblock'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="lg:hidden space-y-3">
                        {filteredUsers.map(u => (
                            <div key={u._id} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm shrink-0">
                                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                            <p className="text-[11px] text-gray-400">{u.email}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                                        u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                        {u.isActive ? 'Active' : 'Blocked'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-t border-gray-100 mb-3">
                                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${roleColors[u.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                        {u.role}
                                    </span>
                                    <span className="text-[11px] text-gray-400">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedUser(u)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                                    >
                                        <FiEye className="w-3.5 h-3.5" /> Details
                                    </button>
                                    {u._id !== currentUser.id && (
                                        <button
                                            onClick={() => toggleUserStatus(u._id, u.isActive)}
                                            disabled={updating === u._id}
                                            className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                                                u.isActive
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                            }`}
                                        >
                                            {updating === u._id ? 'Updating...' : u.isActive ? 'Block' : 'Unblock'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-5 sm:p-6">
                            <div className="flex justify-between items-start mb-5">
                                <h3 className="text-lg font-display text-gray-900">User Details</h3>
                                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="text-center mb-5">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-2xl mx-auto mb-3">
                                    {selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <h4 className="text-base font-medium text-gray-900">{selectedUser.name}</h4>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${roleColors[selectedUser.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                    {selectedUser.role}
                                </span>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <FiMail className="w-4 h-4 text-gray-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase">Email</p>
                                        <p className="text-gray-900">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <FiUsers className="w-4 h-4 text-gray-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase">Status</p>
                                        <p className={selectedUser.isActive ? 'text-green-700' : 'text-red-700'}>
                                            {selectedUser.isActive ? 'Active' : 'Blocked'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <FiUserPlus className="w-4 h-4 text-gray-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase">Joined</p>
                                        <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedUser._id !== currentUser.id && (
                                <button
                                    onClick={() => {
                                        toggleUserStatus(selectedUser._id, selectedUser.isActive);
                                        setSelectedUser(null);
                                    }}
                                    className={`w-full mt-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                        selectedUser.isActive
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    {selectedUser.isActive ? 'Block User' : 'Unblock User'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;