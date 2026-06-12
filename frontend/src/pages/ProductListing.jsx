/**
 * ============================================
 * FAHADÉ - Product Listing Page (Flash Sale Supported)
 * ============================================
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../store/slices/categorySlice';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { FiFilter, FiX } from 'react-icons/fi';
import { useState } from 'react';

const ProductListing = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { products, pagination, loading } = useSelector((state) => state.products);
    const { categories } = useSelector((state) => state.categories); // ✅ ADDED
    const [showFilter, setShowFilter] = useState(false);

    // ✅ ADDED: Fetch categories from backend
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Get current filter/sort values from URL (FIXED: ?? instead of ||)
    const category = searchParams.get('category') ?? '';
    const sort = searchParams.get('sort') ?? 'newest';
    const page = searchParams.get('page') ?? 1;
    const minPrice = searchParams.get('minPrice') ?? '';
    const maxPrice = searchParams.get('maxPrice') ?? '';
    const flashSale = searchParams.get('flashSale') ?? ''; // ✅ NEW: Read Flash Sale param

    useEffect(() => {
        const params = {};
        if (category) params.category = category;
        if (sort) params.sort = sort;
        if (page) params.page = page;
        if (minPrice !== '') params.minPrice = minPrice;
        if (maxPrice !== '') params.maxPrice = maxPrice;
        if (flashSale) params.flashSale = flashSale; // ✅ NEW: Send Flash Sale to backend

        dispatch(fetchProducts(params));
    }, [dispatch, category, sort, page, minPrice, maxPrice, flashSale]);

    // Update URL params
    const updateParams = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    // Clear All Filters
    const clearAllFilters = () => {
        setSearchParams({ sort: 'newest', page: '1' });
    };

    // Check if any filter is active
    const isFilterActive = category || minPrice || maxPrice || flashSale; // ✅ Added flashSale check

    // Decide Page Title based on filters
    const getPageTitle = () => {
        if (flashSale) return 'Flash Sale';
        if (category) return category.charAt(0).toUpperCase() + category.slice(1);
        return 'All Products';
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Page Header */}
            <div className="bg-primary-950 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-display text-white tracking-tight">
                        {getPageTitle()}
                    </h1>
                    <p className="mt-3 text-primary-400 text-sm tracking-wider">
                        {pagination?.totalItems || 0} PRODUCTS FOUND
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Toolbar: Sort & Filter Toggle */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary-100">
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className="flex items-center gap-2 text-sm font-medium tracking-wider uppercase text-primary-700 hover:text-primary-900 transition-colors"
                    >
                        <FiFilter className="w-4 h-4" /> Filters
                        {isFilterActive && <span className="w-2 h-2 bg-accent rounded-full"></span>}
                    </button>

                    <div className="flex items-center gap-4">
                        {isFilterActive && (
                            <button
                                onClick={clearAllFilters}
                                className="text-xs tracking-wider uppercase text-accent hover:underline flex items-center gap-1"
                            >
                                <FiX className="w-3 h-3" /> Clear All
                            </button>
                        )}
                        <select
                            value={sort}
                            onChange={(e) => updateParams('sort', e.target.value)}
                            className="text-sm border border-primary-200 px-3 py-2 bg-white focus:outline-none focus:border-primary-900 cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="popular">Most Popular</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Filters (Desktop) - Hide sidebar if on Flash Sale page */}
                    {!flashSale && (
                        <aside className={`${showFilter ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
                            <div className="sticky top-24 space-y-8">
                                {/* Categories Filter */}
                                <div>
                                    <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-primary-900 mb-4">Categories</h3>
                                    <div className="space-y-2">
                                        {/* ✅ FIXED: Dynamic categories from Redux */}
                                        {categories && categories.length > 0 ? (
                                            categories.map((cat) => (
                                                <button
                                                    key={cat._id}
                                                    onClick={() => updateParams('category', cat.slug)}
                                                    className={`block w-full text-left text-sm py-1 transition-colors ${category === cat.slug
                                                            ? 'text-accent font-medium'
                                                            : 'text-primary-600 hover:text-primary-900'
                                                        }`}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-xs text-primary-400">No categories</p>
                                        )}
                                        {category && (
                                            <button
                                                onClick={() => updateParams('category', '')}
                                                className="text-xs text-accent mt-2 hover:underline"
                                            >
                                                Clear Category
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div>
                                    <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-primary-900 mb-4">Price Range</h3>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'All Prices', min: '', max: '' },
                                            { label: 'Under PKR 5,000', min: '0', max: '5000' },
                                            { label: 'PKR 5,000 - 10,000', min: '5000', max: '10000' },
                                            { label: 'Over PKR 10,000', min: '10000', max: '' },
                                        ].map((range) => (
                                            <button
                                                key={range.label}
                                                onClick={() => {
                                                    const newParams = new URLSearchParams(searchParams);

                                                    if (range.min !== '') {
                                                        newParams.set('minPrice', range.min);
                                                    } else {
                                                        newParams.delete('minPrice');
                                                    }

                                                    if (range.max !== '') {
                                                        newParams.set('maxPrice', range.max);
                                                    } else {
                                                        newParams.delete('maxPrice');
                                                    }

                                                    newParams.set('page', '1');
                                                    setSearchParams(newParams);
                                                }}
                                                className={`block w-full text-left text-sm py-1 transition-colors ${(searchParams.get('minPrice') ?? '') === range.min && (searchParams.get('maxPrice') ?? '') === range.max
                                                        ? 'text-accent font-medium'
                                                        : 'text-primary-600 hover:text-primary-900'
                                                    }`}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* Products Grid */}
                    <div className={`flex-1 ${!flashSale ? '' : 'mx-auto'}`}>
                        {loading ? (
                            <div className="text-center py-20 text-primary-400">Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 text-primary-400">
                                <p className="text-xl font-display mb-2">No Products Found</p>
                                <p className="text-sm mb-6">Try changing the filters or clearing them.</p>
                                <button onClick={clearAllFilters} className="btn-luxury">
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={`grid ${flashSale ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'} gap-6`}>
                                    {products.map((product, index) => (
                                        <ProductCard key={product._id} product={product} index={index} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-12">
                                        <button
                                            onClick={() => updateParams('page', Number(page) - 1)}
                                            disabled={!pagination.hasPrevPage}
                                            className="px-4 py-2 text-sm border border-primary-200 disabled:opacity-40 hover:bg-primary-900 hover:text-white transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-4 py-2 text-sm bg-primary-900 text-white">
                                            {pagination.currentPage}
                                        </span>
                                        <button
                                            onClick={() => updateParams('page', Number(page) + 1)}
                                            disabled={!pagination.hasNextPage}
                                            className="px-4 py-2 text-sm border border-primary-200 disabled:opacity-40 hover:bg-primary-900 hover:text-white transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListing;