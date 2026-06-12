/**
 * ============================================
 * FAHADÉ - Flash Sale Section
 * ============================================
 * Urgency-driven section with countdown timer
 * and horizontal scrolling products.
 * ============================================
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlashSaleProducts } from '../../store/slices/productSlice';
import ProductCard from '../product/ProductCard';
import { FiClock } from 'react-icons/fi';

const FlashSale = () => {
    const dispatch = useDispatch();
    const { flashSaleProducts, loading } = useSelector((state) => state.products);
    
    // Countdown Timer State
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        dispatch(fetchFlashSaleProducts());
    }, [dispatch]);

    // Set countdown (e.g., 24 hours from now for UI demo)
    useEffect(() => {
        const saleEnd = new Date();
        saleEnd.setHours(saleEnd.getHours() + 24);

        const timer = setInterval(() => {
            const now = new Date();
            const difference = saleEnd - now;

            if (difference <= 0) {
                clearInterval(timer);
            } else {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / (1000 * 60)) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return (
            <div className="py-20 text-center text-primary-400 font-body">
                Loading Flash Sale...
            </div>
        );
    }

    if (!flashSaleProducts || flashSaleProducts.length === 0) return null;

    return (
        <section className="py-20 bg-primary-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header with Timer */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                        <span className="text-xs font-medium tracking-[0.3em] uppercase text-accent flex items-center gap-2">
                            <FiClock className="w-4 h-4" /> Limited Time Offer
                        </span>
                        <h2 className="text-4xl md:text-5xl font-display mt-2 text-primary-950">
                            Flash Sale
                        </h2>
                    </div>

                    {/* Countdown Timer Boxes */}
                    <div className="flex items-center gap-3 mt-6 md:mt-0">
                        {[
                            { value: timeLeft.hours, label: 'HRS' },
                            { value: timeLeft.minutes, label: 'MIN' },
                            { value: timeLeft.seconds, label: 'SEC' },
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="bg-primary-950 text-white w-16 h-16 flex flex-col items-center justify-center">
                                    <span className="text-xl font-semibold font-body">
                                        {String(item.value).padStart(2, '0')}
                                    </span>
                                    <span className="text-[8px] tracking-widest opacity-70">{item.label}</span>
                                </div>
                                {index < 2 && <span className="text-2xl font-bold text-primary-900">:</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Products Horizontal Scroll */}
                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4">
                    {flashSaleProducts.map((product, index) => (
                        <div key={product._id} className="w-64 flex-shrink-0">
                            <ProductCard product={product} index={index} />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default FlashSale;