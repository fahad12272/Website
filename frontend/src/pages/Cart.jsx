/**
 * ============================================
 * FAHADÉ - Cart Page
 * ============================================
 * Luxury shopping cart with item management,
 * coupon system, and order summary.
 * ============================================
 */

import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { 
    selectCartItems, 
    selectCartSubtotal, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
} from '../store/slices/cartSlice';
import { useState } from 'react';
import toast from 'react-hot-toast';

const Cart = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const subtotal = useSelector(selectCartSubtotal);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    // Shipping logic (Free over PKR 3000)
    const shippingCost = subtotal >= 3000 ? 0 : 250;
    const totalAmount = subtotal - discount + shippingCost;

    // Handle Quantity Change
    const handleQuantityChange = (item, newQty) => {
        if (newQty < 1) return;
        dispatch(updateQuantity({
            productId: item.product._id,
            size: item.size,
            color: item.color,
            quantity: newQty
        }));
    };

    // Handle Remove Item
    const handleRemove = (item) => {
        dispatch(removeFromCart({
            productId: item.product._id,
            size: item.size,
            color: item.color
        }));
        toast.success('Item removed from cart');
    };

    // Handle Coupon Apply (Frontend Demo - Will connect to backend later)
    const handleApplyCoupon = () => {
        if (couponCode.toUpperCase() === 'WELCOME10') {
            const calcDiscount = Math.round((subtotal * 10) / 100);
            setDiscount(calcDiscount);
            toast.success('Coupon WELCOME10 applied successfully!');
        } else {
            setDiscount(0);
            toast.error('Invalid coupon code');
        }
    };

    // Empty Cart State
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
                <FiShoppingBag className="w-20 h-20 text-primary-200 mb-6" />
                <h2 className="text-3xl font-display text-primary-950 mb-3">Your Cart is Empty</h2>
                <p className="text-primary-500 mb-8 text-center">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/products" className="btn-luxury">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary-50">
            {/* Page Header */}
            <div className="bg-primary-950 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-display text-white tracking-tight">Shopping Cart</h1>
                    <p className="mt-3 text-primary-400 text-sm tracking-wider">{cartItems.length} ITEMS</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                    
                    {/* ============================================
                        LEFT SIDE - Cart Items List
                        ============================================ */}
                    <div className="lg:col-span-7">
                        <div className="flex items-center justify-between mb-6">
                            <Link to="/products" className="flex items-center text-sm text-primary-600 hover:text-primary-900 transition-colors">
                                <FiArrowLeft className="mr-2" /> Continue Shopping
                            </Link>
                            <button 
                                onClick={() => { dispatch(clearCart()); toast.success('Cart cleared'); }}
                                className="text-xs tracking-wider uppercase text-primary-400 hover:text-red-500 transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>

                        <div className="space-y-6">
                            {cartItems.map((item, index) => (
                                <motion.div 
                                    key={`${item.product._id}-${item.size}-${item.color}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="bg-white p-4 sm:p-6 flex gap-4 sm:gap-6 shadow-sm"
                                >
                                    {/* Product Image */}
                                    <Link to={`/product/${item.product.slug}`} className="w-24 h-32 sm:w-32 sm:h-40 flex-shrink-0 bg-primary-50 overflow-hidden">
                                        <img 
                                            src={item.product.images?.[0]?.url || 'https://via.placeholder.com/150'} 
                                            alt={item.product.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </Link>

                                    {/* Product Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[10px] tracking-[0.2em] uppercase text-primary-400 font-medium">
                                                {item.product.brand || 'Fahadé'}
                                            </p>
                                            <Link to={`/product/${item.product.slug}`}>
                                                <h3 className="text-sm sm:text-base font-medium text-primary-900 mt-1 hover:text-accent transition-colors">
                                                    {item.product.name}
                                                </h3>
                                            </Link>
                                            {item.size && (
                                                <p className="text-xs text-primary-500 mt-1">Size: <span className="font-medium text-primary-900">{item.size}</span></p>
                                            )}
                                        </div>

                                        <div className="flex items-end justify-between mt-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center border border-primary-200">
                                                <button 
                                                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-50"
                                                >
                                                    <FiMinus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 h-8 flex items-center justify-center text-sm font-medium border-x border-primary-200">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-50"
                                                >
                                                    <FiPlus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-primary-900">
                                                    PKR {(item.product.price * item.quantity).toLocaleString()}
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className="text-[10px] text-primary-400">PKR {item.product.price?.toLocaleString()} each</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button 
                                        onClick={() => handleRemove(item)}
                                        className="text-primary-300 hover:text-red-500 transition-colors self-start"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* ============================================
                        RIGHT SIDE - Order Summary
                        ============================================ */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-primary-950 text-white p-5 sm:p-8 lg:sticky lg:top-24">
                            <h2 className="text-xl font-display tracking-wider mb-6">Order Summary</h2>

                            {/* Coupon Code Input */}
                            <div className="flex mb-8 border-b border-primary-700 pb-8">
                                <input 
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter Coupon Code"
                                    className="flex-1 bg-transparent border border-primary-700 px-4 py-2 text-sm placeholder:text-primary-600 focus:border-accent focus:outline-none"
                                />
                                <button 
                                    onClick={handleApplyCoupon}
                                    className="px-6 py-2 text-xs font-medium tracking-widest uppercase border border-l-0 border-accent text-accent hover:bg-accent hover:text-white transition-colors"
                                >
                                    Apply
                                </button>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-primary-300">
                                    <span>Subtotal</span>
                                    <span>PKR {subtotal.toLocaleString()}</span>
                                </div>
                                
                                {discount > 0 && (
                                    <div className="flex justify-between text-accent">
                                        <span>Discount (Coupon)</span>
                                        <span>- PKR {discount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-primary-300">
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? <span className="text-green-400">FREE</span> : `PKR ${shippingCost}`}</span>
                                </div>
                                
                                {subtotal < 3000 && (
                                    <p className="text-[10px] text-primary-500">
                                        Add PKR {(3000 - subtotal).toLocaleString()} more for free shipping
                                    </p>
                                )}
                            </div>

                            {/* Total */}
                            <div className="flex justify-between mt-6 pt-6 border-t border-primary-700 text-lg font-semibold">
                                <span>Total</span>
                                <span>PKR {totalAmount.toLocaleString()}</span>
                            </div>

                            {/* Checkout Button */}
                            <Link 
                                to="/checkout"
                                className="block w-full text-center mt-8 px-8 py-4 text-sm font-medium tracking-widest uppercase bg-white text-primary-950 hover:bg-accent hover:text-white transition-colors duration-300"
                            >
                                Proceed to Checkout
                            </Link>

                            {/* Security Note */}
                            <p className="text-[10px] text-primary-500 text-center mt-4 tracking-wider">
                                🔒 SECURE CHECKOUT - SSL ENCRYPTED
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Cart;