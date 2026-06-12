/**
 * ============================================
 * FAHADÉ - Product Card Component (Wishlist Fixed)
 * ============================================
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa'; // Filled Heart Icon
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product, index = 0 }) => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    // ✅ FIXED: Convert ObjectId to string for comparison
    const isWishlisted = isAuthenticated && user?.wishlist?.some(id => String(id) === String(product._id));

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(addToCart({ product, quantity: 1 }));
        toast.success(`${product.name} added to cart`);
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please login to add to wishlist');
            return;
        }
        dispatch(toggleWishlist(product._id));
        if (isWishlisted) {
            toast.success('Removed from wishlist');
        } else {
            toast.success('Added to wishlist ❤️');
        }
    };

    const discount = product.compareAtPrice
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group relative"
        >
            <Link to={`/product/${product.slug}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-square sm:aspect-[3/4] overflow-hidden bg-primary-50 mb-2 sm:mb-4">
                    <img
                        src={product.images?.[0]?.url || ''}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                    {/* Fallback if image fails to load */}
                    <div
                        className="w-full h-full bg-primary-100 items-center justify-center hidden"
                    >
                        <FiShoppingBag className="w-8 h-8 text-primary-300" />
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {discount > 0 && (
                            <span className="bg-accent text-white text-[10px] font-bold px-2 py-1 tracking-wider">
                                -{discount}%
                            </span>
                        )}
                        {product.isNewArrival && (
                            <span className="bg-primary-900 text-white text-[10px] font-bold px-2 py-1 tracking-wider">
                                NEW
                            </span>
                        )}
                    </div>

                    {/* Quick Action Buttons (Appear on Hover) */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-white text-primary-900 py-2 text-xs font-semibold tracking-widest uppercase hover:bg-accent hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <FiShoppingBag className="w-4 h-4" /> Add to Cart
                        </button>
                    </div>

                    {/* Wishlist Icon (Always visible, changes color) */}
                    <button
                        onClick={handleWishlist}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                        {isWishlisted ? (
                            <FaHeart className="w-4 h-4 text-red-500" /> // Filled Red Heart
                        ) : (
                            <FiHeart className="w-4 h-4 text-primary-900" /> // Empty Heart
                        )}
                    </button>
                </div>

                {/* Product Info */}
                <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-primary-400 font-medium">
                        {product.brand || 'Fahadé'}
                    </p>
                    <h3 className="text-xs sm:text-sm font-medium text-primary-900 truncate group-hover:text-accent transition-colors duration-300">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary-900">
                            PKR {product.price?.toLocaleString()}
                        </span>
                        {product.compareAtPrice && (
                            <span className="text-xs text-primary-400 line-through">
                                PKR {product.compareAtPrice?.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;