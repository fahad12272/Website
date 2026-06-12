/**
 * ============================================
 * FAHADÉ - Home Page (Dynamic Categories)
 * ============================================
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import FlashSale from '../components/home/FlashSale';
import TrendingProducts from '../components/home/TrendingProducts';
import { fetchCategories } from '../store/slices/categorySlice';
import HeroSlider from '../components/home/HeroSlider';

// Animation Variants
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 1 },
    visible: { transition: { staggerChildren: 0.15 } }
};

const Home = () => {
    // ✅ FIXED: Hooks must be INSIDE the component
    const dispatch = useDispatch();
    const { categories } = useSelector((state) => state.categories);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    return (
        <div className="overflow-hidden">

            {/* ============================================
                HERO SECTION (Gucci Dark Luxury Style)
                ============================================ */}
            {/* <section className="relative h-[100vh] flex items-center bg-primary-950">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80"
                        alt="Luxury Fashion"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-950/90 via-primary-950/50 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="max-w-2xl"
                    >
                        <motion.span variants={fadeUp} className="inline-block text-xs font-medium tracking-[0.3em] uppercase text-accent mb-4">
                            Winter Collection 2024
                        </motion.span>

                        <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-semibold text-white leading-[0.9] mb-4 sm:mb-6">
                            Redefine<br />Luxury
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-lg text-primary-300 mb-8 max-w-md leading-relaxed">
                            Experience the art of refined living. Crafted for the modern connoisseur.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                            <Link to="/products" className="px-8 py-3 text-sm font-medium tracking-widest uppercase border border-white text-white hover:bg-white hover:text-primary-950 transition-all duration-300">
                                Explore Collection
                            </Link>
                            <Link to="/products?flashSale=true" className="px-8 py-3 text-sm font-medium tracking-widest uppercase border border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300">
                                Flash Sale
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-primary-400">
                    <div className="w-[1px] h-12 bg-primary-500 mx-auto mb-2"></div>
                    <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
                </motion.div>
            </section> */}
            <HeroSlider />

            {/* ============================================
                FLASH SALE (With Countdown Timer)
                ============================================ */}
            <FlashSale />

            {/* ============================================
                ✅ FIXED: CATEGORIES SECTION (Dynamic from Backend)
                ============================================ */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
                        <span className="text-xs font-medium tracking-[0.3em] uppercase text-accent">Browse By</span>
                        <h2 className="text-4xl md:text-5xl font-display mt-3 text-primary-950">Categories</h2>
                    </motion.div>

                    {/* ✅ CHECK: If categories exist in DB, show them. Otherwise show fallback. */}
                    {categories && categories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {categories.slice(0, 6).map((cat, index) => (
                                <motion.div key={cat._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.15 }}>
                                    <Link to={`/products?category=${cat.slug}`} className="group relative block h-[500px] overflow-hidden">
                                        <img
                                            src={cat.image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80'}
                                            alt={cat.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                                        <div className="absolute bottom-8 left-8">
                                            <h3 className="text-3xl font-display text-white mb-2">{cat.name}</h3>
                                            <span className="inline-flex items-center text-white text-xs tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                Shop Now <FiArrowRight className="ml-2" />
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-primary-400">
                            <p className="text-lg font-display">No categories found</p>
                            <p className="text-sm">Add categories from the Admin Panel</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ============================================
                TRENDING PRODUCTS (Backend Connected)
                ============================================ */}
            <TrendingProducts />

        </div>
    );
};

export default Home;