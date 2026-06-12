import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { fetchBanners } from '../../store/slices/bannerSlice';

const HeroSlider = () => {
    const dispatch = useDispatch();
    const { banners } = useSelector((state) => state.banners);

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        dispatch(fetchBanners());
    }, [dispatch]);

    const heroBanners = Array.isArray(banners)
        ? banners.filter(
            banner =>
                banner.position === 'hero' &&
                banner.isActive
        )
        : [];
    //         console.log('All Banners:', banners);
    // console.log('Hero Banners:', heroBanners);


    useEffect(() => {

        if (!heroBanners || heroBanners.length <= 1) return;

        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % heroBanners.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [heroBanners]);

    if (!heroBanners.length) return null;

    const banner = heroBanners[current] || heroBanners[0];

    const imageUrl =
        banner?.image?.startsWith('http')
            ? banner.image
            : `${import.meta.env.VITE_API_URL}${banner?.image || ''}`;

    // console.log("Current:", current);
    // console.log("Banner:", banner);
    // console.log("Image URL:", imageUrl);

    return (
        <section className="relative h-screen overflow-hidden">

            <AnimatePresence mode="wait">
                <motion.div
                    key={banner._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <img
                        src={imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/50" />
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full">

                    <div className="max-w-2xl text-white">

                        {banner.subtitle && (
                            <span className="block mb-4 text-sm uppercase tracking-[0.3em]">
                                {banner.subtitle}
                            </span>
                        )}

                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            {banner.title}
                        </h1>

                        {banner.description && (
                            <p className="text-lg mb-8">
                                {banner.description}
                            </p>
                        )}

                        {banner.ctaText && (
                            <Link
                                to="/products"
                                className="inline-block px-8 py-4 border border-white text-white hover:bg-white hover:text-black transition-all"
                            >
                                {banner.ctaText}
                            </Link>
                        )}

                    </div>
                </div>
            </div>



            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroBanners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-3 h-3 rounded-full ${current === index
                            ? 'bg-white'
                            : 'bg-white/40'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroSlider;