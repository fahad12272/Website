/**
 * ============================================
 * FAHADÉ - Trending Products Section
 * ============================================
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrendingProducts } from '../../store/slices/productSlice';
import ProductCard from '../product/ProductCard';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const TrendingProducts = () => {
    const dispatch = useDispatch();
    const { trendingProducts, loading } = useSelector((state) => state.products);

    useEffect(() => {
        dispatch(fetchTrendingProducts());
    }, [dispatch]);

    if (loading) {
        return <div className="py-20 text-center text-primary-400">Loading Trending...</div>;
    }

    if (!trendingProducts || trendingProducts.length === 0) return null;

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <span className="text-xs font-medium tracking-[0.3em] uppercase text-accent">What's Hot</span>
                        <h2 className="text-4xl md:text-5xl font-display mt-2 text-primary-950">Trending Now</h2>
                    </div>
                    <Link 
                        to="/products" 
                        className="hidden md:flex items-center text-xs tracking-[0.2em] uppercase text-primary-600 hover:text-primary-900 transition-colors group"
                    >
                        View All 
                        <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Products Grid (4 Columns) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {trendingProducts.slice(0, 8).map((product, index) => (
                        <ProductCard key={product._id} product={product} index={index} />
                    ))}
                </div>

                {/* Mobile View All Button */}
                <div className="mt-10 text-center md:hidden">
                    <Link to="/products" className="btn-luxury">
                        View All Products
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default TrendingProducts;