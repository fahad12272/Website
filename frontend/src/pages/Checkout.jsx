/**
 * ============================================
 * FAHADÉ - Checkout Page (FIXED)
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCreditCard, FiSmartphone, FiHome, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { selectCartItems, selectCartSubtotal, clearCart } from '../store/slices/cartSlice';
import { createOrder, clearOrderState } from '../store/slices/orderSlice';
import toast from 'react-hot-toast';

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector(selectCartItems);
    const subtotal = useSelector(selectCartSubtotal);
    const { loading, success, currentOrder, error } = useSelector((state) => state.order);
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [discount, setDiscount] = useState(subtotal >= 3000 ? Math.round((subtotal * 10) / 100) : 0);

    // ✅ FIXED: Shipping form with proper defaults
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Pakistan',
    });

    const [formErrors, setFormErrors] = useState({});

    const shippingCost = subtotal >= 3000 ? 0 : 250;
    const totalAmount = subtotal - discount + shippingCost;

    // Redirect if cart is empty
    // ✅ FIXED: Only redirect if cart is empty AND no order was just placed
    useEffect(() => {
        if (cartItems.length === 0 && !success && !currentOrder) {
            navigate('/cart');
        }
    }, [cartItems, navigate, success, currentOrder]);

    // ✅ FIXED: Handle Order Success - only run once
    useEffect(() => {
        if (success && currentOrder) {
            dispatch(clearCart());
            toast.success('Order placed successfully!');
            // Don't clear order state here - let success screen show
            // It will be cleared when user navigates away
        }
    }, [success, currentOrder, dispatch]);
    // Handle Input Change
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (formErrors[e.target.name]) {
            setFormErrors({ ...formErrors, [e.target.name]: '' });
        }
    };

    // ✅ FIXED: Validate form before placing order
    const validateForm = () => {
        const errors = {};
        if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
        if (!formData.phone.trim()) errors.phone = 'Phone number is required';
        if (!formData.street.trim()) errors.street = 'Street address is required';
        if (!formData.city.trim()) errors.city = 'City is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ✅ FIXED: Place Order with proper data
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please login to place an order');
            navigate('/login');
            return;
        }

        if (!validateForm()) {
            toast.error('Please fill in all required shipping fields');
            return;
        }

        const orderData = {
            items: cartItems.map(item => ({
                product: item.product._id,
                name: item.product.name,
                image: item.product.images?.[0]?.url || '',
                price: item.product.price,
                quantity: item.quantity,
                size: item.size || '',
                color: item.color || '',
            })),
            shippingAddress: {
                fullName: formData.fullName,
                phone: formData.phone,
                street: formData.street,
                city: formData.city,
                state: formData.state || 'N/A',
                postalCode: formData.postalCode || 'N/A',
                country: formData.country || 'Pakistan',
            },
            paymentMethod,
            couponCode: discount > 0 ? 'WELCOME10' : null,
            customerNotes: '',
        };

        dispatch(createOrder(orderData));
    };

    // Order Success UI
    if (success && currentOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCheck className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-display text-primary-950 mb-3">Order Confirmed!</h2>
                    <p className="text-primary-600 mb-2">Thank you for shopping with Fahadé.</p>
                    <p className="text-sm text-primary-400 mb-8">Order Number: <span className="font-semibold text-primary-900">{currentOrder.orderNumber}</span></p>

                    <div className="space-y-4">
                        <Link to="/" className="btn-luxury block text-center">
                            Continue Shopping
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary-50">
            {/* Page Header */}
            <div className="bg-primary-950 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-display text-white tracking-tight">Checkout</h1>
                    <p className="mt-3 text-primary-400 text-sm tracking-wider">SECURE PAYMENT</p>
                </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link to="/cart" className="flex items-center text-sm text-primary-600 hover:text-primary-900 mb-8">
                    <FiArrowLeft className="mr-2" /> Back to Cart
                </Link>

                <div className="lg:grid lg:grid-cols-12 lg:gap-12 space-y-8 lg:space-y-0">

                    {/* LEFT SIDE - Shipping & Payment */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* ✅ FIXED: Shipping Address with proper validation */}
                        <div className="bg-white p-6 sm:p-8 shadow-sm">
                            <h2 className="text-xl font-display text-primary-950 mb-6 flex items-center gap-2">
                                <FiHome className="w-5 h-5" /> Shipping Address
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-xs tracking-wider uppercase text-primary-500 block mb-1">Full Name *</label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={`input-luxury ${formErrors.fullName ? 'border-red-500' : ''}`} />
                                    {formErrors.fullName && <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>}
                                </div>
                                <div>
                                    <label className="text-xs tracking-wider uppercase text-primary-500 block mb-1">Phone Number *</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={`input-luxury ${formErrors.phone ? 'border-red-500' : ''}`} />
                                    {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                                </div>
                                <div>
                                    <label className="text-xs tracking-wider uppercase text-primary-500 block mb-1">City *</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={`input-luxury ${formErrors.city ? 'border-red-500' : ''}`} />
                                    {formErrors.city && <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs tracking-wider uppercase text-primary-500 block mb-1">Street Address *</label>
                                    <input type="text" name="street" value={formData.street} onChange={handleInputChange} className={`input-luxury ${formErrors.street ? 'border-red-500' : ''}`} />
                                    {formErrors.street && <p className="text-xs text-red-500 mt-1">{formErrors.street}</p>}
                                </div>
                                <div>
                                    <label className="text-xs tracking-wider uppercase text-primary-500 block mb-1">State/Province</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="input-luxury" />
                                </div>
                                <div>
                                    <label className="text-xs tracking-wider uppercase text-primary-500 block mb-1">Postal Code</label>
                                    <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="input-luxury" />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 sm:p-8 shadow-sm">
                            <h2 className="text-xl font-display text-primary-950 mb-6 flex items-center gap-2">
                                <FiCreditCard className="w-5 h-5" /> Payment Method
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { id: 'cod', label: 'Cash on Delivery', icon: FiHome, desc: 'Pay when your order arrives' },
                                    { id: 'jazzcash', label: 'JazzCash', icon: FiSmartphone, desc: 'Mobile Wallet Payment (Demo)' },
                                    { id: 'easypaisa', label: 'Easypaisa', icon: FiSmartphone, desc: 'Mobile Wallet Payment (Demo)' },
                                    { id: 'bank_transfer', label: 'Bank Transfer', icon: FiCreditCard, desc: 'Direct Bank Transfer (Demo)' },
                                ].map((method) => (
                                    <label
                                        key={method.id}
                                        className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-primary-900 bg-primary-50' : 'border-primary-100 hover:border-primary-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={paymentMethod === method.id}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 accent-primary-900"
                                        />
                                        <method.icon className="w-6 h-6 text-primary-700" />
                                        <div>
                                            <p className="text-sm font-medium text-primary-900">{method.label}</p>
                                            <p className="text-xs text-primary-500">{method.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {paymentMethod === 'jazzcash' && (
                                <div className="mt-6 p-4 bg-primary-50 border border-primary-100">
                                    <p className="text-xs text-primary-500 mb-2">Demo JazzCash Account:</p>
                                    <p className="text-sm font-medium text-primary-900">Account: 0300-1234567</p>
                                    <p className="text-sm text-primary-600">Reference: FAHADE-ORDER</p>
                                </div>
                            )}
                            {paymentMethod === 'easypaisa' && (
                                <div className="mt-6 p-4 bg-primary-50 border border-primary-100">
                                    <p className="text-xs text-primary-500 mb-2">Demo Easypaisa Account:</p>
                                    <p className="text-sm font-medium text-primary-900">Account: 0321-9876543</p>
                                    <p className="text-sm text-primary-600">Reference: FAHADE-ORDER</p>
                                </div>
                            )}
                            {paymentMethod === 'bank_transfer' && (
                                <div className="mt-6 p-4 bg-primary-50 border border-primary-100">
                                    <p className="text-xs text-primary-500 mb-2">Demo Bank Details:</p>
                                    <p className="text-sm font-medium text-primary-900">Bank: HBL (Habib Bank Limited)</p>
                                    <p className="text-sm text-primary-600">Account: Fahadé Pvt Ltd</p>
                                    <p className="text-sm text-primary-600">IBAN: PK36HABB0012345678901234</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE - Order Summary */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-primary-950 text-white p-8 sticky top-24">
                            <h2 className="text-xl font-display tracking-wider mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={`${item.product._id}-${item.size}`} className="flex gap-3">
                                        <div className="w-16 h-20 bg-primary-800 flex-shrink-0 overflow-hidden">
                                            <img src={item.product.images?.[0]?.url || ''} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-white truncate">{item.product.name}</p>
                                            <p className="text-[10px] text-primary-400">Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ''}</p>
                                        </div>
                                        <p className="text-xs font-medium text-white">PKR {(item.product.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 text-sm border-t border-primary-700 pt-6">
                                <div className="flex justify-between text-primary-300">
                                    <span>Subtotal</span>
                                    <span>PKR {subtotal.toLocaleString()}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-accent">
                                        <span>Discount (WELCOME10)</span>
                                        <span>- PKR {discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-primary-300">
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? <span className="text-green-400">FREE</span> : `PKR ${shippingCost}`}</span>
                                </div>
                            </div>

                            <div className="flex justify-between mt-6 pt-6 border-t border-primary-700 text-lg font-semibold">
                                <span>Total</span>
                                <span>PKR {totalAmount.toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-8 px-8 py-4 text-sm font-medium tracking-widest uppercase bg-white text-primary-950 hover:bg-accent hover:text-white transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <span className="animate-pulse">Placing Order...</span> : 'Place Order'}
                            </button>

                            <p className="text-[10px] text-primary-500 text-center mt-4 tracking-wider">
                                🔒 SECURE CHECKOUT - SSL ENCRYPTED
                            </p>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default Checkout;