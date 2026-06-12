/**
 * ============================================
 * FAHADÉ - Product Details Page (FIXED)
 * ============================================
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductBySlug } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/authSlice';
import { FiShoppingBag, FiHeart, FiMinus, FiPlus } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa'; // Filled heart
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ProductDetails = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const { currentProduct: product, loading } = useSelector((state) => state.products);

    // ✅ FIXED: Auth state properly extracted
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        dispatch(fetchProductBySlug(slug));
    }, [dispatch, slug]);

    useEffect(() => {
        setSelectedSize('');
        setQuantity(1);
        setActiveImage(0);
    }, [slug]);

    const handleAddToCart = () => {
        if (!selectedSize && product?.variants?.length > 0) {
            toast.error('Please select a size');
            return;
        }
        dispatch(addToCart({ product, quantity, size: selectedSize }));
        toast.success(`${product.name} added to cart!`);
    };

    // ✅ FIXED: Wishlist handler function
    const handleWishlist = () => {
        if (!isAuthenticated) {
            toast.error('Please login to add to wishlist');
            return;
        }
        dispatch(toggleWishlist(product._id));
        if (user?.wishlist?.some(id => String(id) === String(product._id))) {
            toast.success('Removed from wishlist');
        } else {
            toast.success('Added to wishlist ❤️');
        }
    };

    // ✅ FIXED: String comparison for ObjectId
    const isWishlisted = isAuthenticated && user?.wishlist?.some(id => String(id) === String(product?._id));

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-primary-400">Loading...</div>;
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center text-primary-400">Product not found.</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-20">

                    {/* Left Side - Images */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="aspect-[3/4] bg-primary-50 overflow-hidden mb-4">
                            <img
                                src={product.images?.[activeImage]?.url || ''}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            {/* Fallback if image fails */}
                            <div className="w-full h-full bg-primary-50 items-center justify-center hidden">
                                <FiShoppingBag className="w-16 h-16 text-primary-200" />
                            </div>
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-3">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(index)}
                                        className={`w-20 h-24 overflow-hidden border-2 transition-colors ${activeImage === index ? 'border-primary-900' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Right Side - Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col"
                    >
                        <p className="text-xs tracking-[0.2em] uppercase text-primary-400 font-medium mb-2">
                            {product.brand || 'Fahadé'}
                        </p>

                        <h1 className="text-3xl md:text-4xl font-display text-primary-950 mb-4">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="flex items-center gap-3 mb-8">
                            <span className="text-2xl font-semibold text-primary-900">
                                PKR {product.price?.toLocaleString()}
                            </span>
                            {product.compareAtPrice && (
                                <span className="text-lg text-primary-400 line-through">
                                    PKR {product.compareAtPrice?.toLocaleString()}
                                </span>
                            )}
                            {product.compareAtPrice && (
                                <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1">
                                    {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-primary-600 leading-relaxed mb-8">
                            {product.description}
                        </p>

                        {/* Size Selector */}
                        {product.variants?.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-primary-900 mb-4">
                                    Select Size
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant) => {
                                        const isOutOfStock = !variant.stock || variant.stock === 0;
                                        const isSelected = selectedSize === variant.size;

                                        return (
                                            <button
                                                key={variant._id || variant.size}
                                                onClick={() => !isOutOfStock && setSelectedSize(variant.size)}
                                                disabled={isOutOfStock}
                                                className={`h-14 px-4 flex flex-col items-center justify-center text-sm font-medium border transition-all duration-200 ${isSelected
                                                    ? 'border-primary-900 bg-primary-900 text-white'
                                                    : isOutOfStock
                                                        ? 'border-primary-100 text-primary-300 cursor-not-allowed'
                                                        : 'border-primary-200 text-primary-900 hover:border-primary-900'
                                                    }`}
                                            >
                                                <span className={isOutOfStock ? 'line-through' : ''}>{variant.size}</span>
                                                {isOutOfStock && <span className="text-[8px] text-red-400">Out of Stock</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                                {!selectedSize && <p className="text-xs text-accent mt-2">Please select a size</p>}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="mb-8">
                            <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-primary-900 mb-4">
                                Quantity
                            </h3>
                            <div className="flex items-center border border-primary-200 w-fit">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 flex items-center justify-center text-primary-900 hover:bg-primary-50 transition-colors"
                                >
                                    <FiMinus />
                                </button>
                                <span className="w-12 h-12 flex items-center justify-center text-primary-900 font-medium border-x border-primary-200">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-12 h-12 flex items-center justify-center text-primary-900 hover:bg-primary-50 transition-colors"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                        </div>

                        {/* ✅ FIXED: Action Buttons with Working Wishlist */}
                        <div className="flex gap-4 mt-auto">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-primary-950 text-white text-sm font-medium tracking-widest uppercase hover:bg-accent transition-colors duration-300"
                            >
                                <FiShoppingBag className="w-5 h-5" /> Add to Cart
                            </button>
                            <button
                                onClick={handleWishlist}
                                className={`w-14 h-14 border flex items-center justify-center transition-colors ${isWishlisted
                                    ? 'border-red-300 text-red-500 bg-red-50'
                                    : 'border-primary-200 text-primary-900 hover:border-accent hover:text-accent'
                                    }`}
                            >
                                {isWishlisted ? (
                                    <FaHeart className="w-5 h-5" />
                                ) : (
                                    <FiHeart className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Specifications */}
                        {product.specifications?.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-primary-100">
                                <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-primary-900 mb-4">
                                    Specifications
                                </h3>
                                <div className="space-y-2">
                                    {product.specifications.map((spec, i) => (
                                        <div key={i} className="flex justify-between text-sm py-2 border-b border-primary-50">
                                            <span className="text-primary-500">{spec.label}</span>
                                            <span className="text-primary-900 font-medium">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;