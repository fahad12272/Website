/**
 * ============================================
 * FAHADÉ - Profile Sidebar (Right Slide-in)
 * ============================================
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLogOut, FiTrash2, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import { logout, deleteAccount } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ProfileSidebar = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // ✅ FIXED: Proper logout with redirect
    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            toast.success('Logged out successfully');
            onClose();
            window.location.href = '/'; // Force redirect to home
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    // ✅ FIXED: Proper delete with redirect
    const handleDeleteAccount = async () => {
        try {
            await dispatch(deleteAccount()).unwrap();
            toast.success('Account deleted successfully');
            onClose();
            window.location.href = '/'; // Force redirect to home
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Sidebar Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white z-50 shadow-2xl overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-primary-100">
                            <h2 className="text-xl font-display text-primary-950">My Profile</h2>
                            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-primary-900 hover:bg-primary-50">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Profile Info */}
                        <div className="p-6 space-y-6">
                            {/* Avatar & Name */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                                    <FiUser className="w-8 h-8 text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-primary-900">{user?.name || 'Guest'}</h3>
                                    <p className="text-sm text-primary-500">{user?.email}</p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-4 pt-4 border-t border-primary-100">
                                <div className="flex items-center gap-3 text-sm">
                                    <FiUser className="w-5 h-5 text-primary-400" />
                                    <span className="text-primary-500 w-24">Full Name</span>
                                    <span className="font-medium text-primary-900">{user?.name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <FiMail className="w-5 h-5 text-primary-400" />
                                    <span className="text-primary-500 w-24">Email</span>
                                    <span className="font-medium text-primary-900">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <FiCalendar className="w-5 h-5 text-primary-400" />
                                    <span className="text-primary-500 w-24">Joined</span>
                                    <span className="font-medium text-primary-900">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-6 border-t border-primary-100">
                                {/* ✅ NEW: Admin/Supplier Panel Link */}
                                {(user?.role === 'admin' || user?.role === 'supplier') && (
                                    <Link
                                        to="/admin"
                                        onClick={onClose}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-950 text-white text-sm font-medium tracking-wider uppercase hover:bg-accent transition-colors"
                                    >
                                        👑 {user?.role === 'admin' ? 'Admin' : 'Supplier'} Panel
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-primary-200 text-primary-900 text-sm font-medium tracking-wider uppercase hover:bg-primary-900 hover:text-white transition-colors"
                                >
                                    <FiLogOut /> Logout
                                </button>

                                {/* Delete Account */}
                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 text-red-500 text-xs tracking-wider uppercase hover:bg-red-50 transition-colors"
                                    >
                                        <FiTrash2 /> Delete Account Permanently
                                    </button>
                                ) : (
                                    <div className="bg-red-50 p-4 border border-red-200 text-center">
                                        <p className="text-sm text-red-700 mb-3">Are you sure? This action cannot be undone.</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="flex-1 px-4 py-2 text-xs border border-primary-200 hover:bg-primary-100"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                className="flex-1 px-4 py-2 text-xs bg-red-600 text-white hover:bg-red-700"
                                            >
                                                Yes, Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProfileSidebar;