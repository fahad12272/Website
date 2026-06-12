/**
 * ============================================
 * FAHADÉ - Luxury Navigation Bar (Responsive)
 * ============================================
 */

import { Link } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiSearch, FiMenu, FiHeart, FiLogIn, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectCartItemCount } from '../../store/slices/cartSlice';
import { useState } from 'react';
import ProfileSidebar from './ProfileSidebar';

const Navbar = () => {
    const cartItemCount = useSelector(selectCartItemCount);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const wishlistCount = user?.wishlist?.length || 0;
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // All nav links
    const navLinks = ['Men', 'Women', 'Watches', 'Shoes', 'Accessories'];

    return (
        <>
            <nav className="sticky top-0 z-30 bg-white border-b border-primary-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        
                        {/* Left: Hamburger Menu (Mobile only) */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-primary-900 hover:bg-primary-50 rounded"
                        >
                            <FiMenu className="w-6 h-6" />
                        </button>

                        {/* Center: Logo */}
                        <Link to="/" className="flex-shrink-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold tracking-[0.2em] sm:tracking-[0.3em] text-primary-900 uppercase">
                                Fahadé
                            </h1>
                        </Link>

                        {/* Middle: Desktop Nav Links */}
                        <div className="hidden lg:flex items-center space-x-8">
                            {navLinks.map((item) => (
                                <Link 
                                    key={item} 
                                    to={`/products?category=${item.toLowerCase()}`} 
                                    className="text-xs font-medium tracking-[0.2em] uppercase text-primary-600 hover:text-primary-900 transition-colors duration-300 relative group"
                                >
                                    {item}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary-900 transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            ))}
                        </div>

                        {/* Right: Icons */}
                        <div className="flex items-center gap-3 sm:gap-5">
                            {/* Search */}
                            <FiSearch className="w-5 h-5 text-primary-700 cursor-pointer hover:text-primary-900 hidden sm:block" />
                            
                            {/* Wishlist */}
                            <Link to="/wishlist" className="relative hidden sm:block">
                                <FiHeart className="w-5 h-5 text-primary-700 hover:text-primary-900" />
                                {isAuthenticated && wishlistCount > 0 && (
                                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="relative">
                                <FiShoppingBag className="w-5 h-5 text-primary-700 hover:text-primary-900" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>

                            {/* Profile / Login */}
                            {isAuthenticated ? (
                                <button 
                                    onClick={() => setIsProfileOpen(true)} 
                                    className="w-8 h-8 bg-primary-900 text-white rounded-full flex items-center justify-center text-xs font-bold"
                                >
                                    {user?.name?.charAt(0).toUpperCase()}
                                </button>
                            ) : (
                                <Link to="/login" className="hidden sm:flex items-center gap-1 text-xs tracking-wider uppercase text-primary-700 hover:text-primary-900">
                                    <FiLogIn className="w-4 h-4" /> Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ============================================
                MOBILE MENU (Full Screen Overlay)
                ============================================ */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-white lg:hidden overflow-y-auto"
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-10">
                                <h1 className="text-2xl font-display tracking-[0.3em] uppercase">Fahadé</h1>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-primary-50 rounded"
                                >
                                    <FiX className="w-6 h-6 text-primary-900" />
                                </button>
                            </div>

                            {/* Nav Links */}
                            <div className="space-y-1 mb-10">
                                {navLinks.map((item, index) => (
                                    <motion.div
                                        key={item}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link 
                                            to={`/products?category=${item.toLowerCase()}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block py-4 text-lg font-display text-primary-900 border-b border-primary-50 hover:text-accent transition-colors"
                                        >
                                            {item}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Quick Links */}
                            <div className="space-y-4 mb-10">
                                <Link 
                                    to="/wishlist" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 text-sm text-primary-600 hover:text-primary-900"
                                >
                                    <FiHeart className="w-5 h-5" /> Wishlist
                                </Link>
                                <Link 
                                    to="/cart" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 text-sm text-primary-600 hover:text-primary-900"
                                >
                                    <FiShoppingBag className="w-5 h-5" /> Cart ({cartItemCount})
                                </Link>
                                {!isAuthenticated && (
                                    <Link 
                                        to="/login" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 text-sm text-primary-600 hover:text-primary-900"
                                    >
                                        <FiLogIn className="w-5 h-5" /> Login / Register
                                    </Link>
                                )}
                            </div>

                            {/* CTA Button */}
                            <Link 
                                to="/products" 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="btn-luxury block text-center"
                            >
                                Shop All Products
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Sidebar */}
            <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    );
};

export default Navbar;