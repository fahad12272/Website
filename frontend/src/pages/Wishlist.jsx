/**
 * ============================================
 * FAHADÉ - Wishlist Page (FIXED)
 * ============================================
 */

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { fetchProducts } from '../store/slices/productSlice';
import { FiHeart } from 'react-icons/fi';

const Wishlist = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { products } = useSelector((state) => state.products);

    const wishlistIds = user?.wishlist || [];

    // Fetch all products and filter wishlist ones
    useEffect(() => {
        dispatch(fetchProducts({ limit: 100 }));
    }, [dispatch]);

    // ✅ FIXED: Compare wishlist IDs with product IDs using string conversion
    const wishlistProducts = products.filter(p => 
        wishlistIds.some(id => String(id) === String(p._id))
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
                <FiHeart className="w-20 h-20 text-primary-200 mb-6" />
                <h2 className="text-3xl font-display text-primary-950 mb-3">Please Login</h2>
                <p className="text-primary-500 mb-8">You need to login to see your wishlist.</p>
                <Link to="/login" className="btn-luxury">Login Now</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-primary-950 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-display text-white tracking-tight">My Wishlist</h1>
                    <p className="mt-3 text-primary-400 text-sm tracking-wider">{wishlistProducts.length} ITEMS</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {wishlistProducts.length === 0 ? (
                    <div className="text-center py-20 text-primary-400">
                        <FiHeart className="w-16 h-16 mx-auto mb-4 text-primary-200" />
                        <p className="text-xl font-display mb-2">Your Wishlist is Empty</p>
                        <p className="text-sm mb-6">Save your favorite items here.</p>
                        <Link to="/products" className="btn-luxury">Browse Products</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {wishlistProducts.map((product, index) => (
                            <ProductCard key={product._id} product={product} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;