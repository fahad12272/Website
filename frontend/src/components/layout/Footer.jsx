/**
 * ============================================
 * FAHADÉ - Luxury Footer
 * ============================================
 */

import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-primary-950 text-primary-300 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    
                    {/* Brand Column */}
                    <div className="md:col-span-1">
                        <h2 className="text-2xl font-display tracking-[0.3em] text-white uppercase mb-4">Fahadé</h2>
                        <p className="text-sm leading-relaxed text-primary-400">
                            Redefining luxury lifestyle. Premium clothing, watches, and accessories crafted for the modern connoisseur.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-white mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            {['New Arrivals', 'Best Sellers', 'Sale', 'Gift Cards'].map((item) => (
                                <li key={item}>
                                    <Link to="/products" className="text-sm text-primary-400 hover:text-accent transition-colors duration-300">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-white mb-6">Customer Care</h3>
                        <ul className="space-y-3">
                            {['Contact Us', 'Shipping Policy', 'Returns & Exchanges', 'FAQs'].map((item) => (
                                <li key={item}>
                                    <Link to="/" className="text-sm text-primary-400 hover:text-accent transition-colors duration-300">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-white mb-6">Newsletter</h3>
                        <p className="text-sm text-primary-400 mb-4">Subscribe for exclusive updates and offers.</p>
                        <div className="flex border border-primary-700">
                            <input 
                                type="email" 
                                placeholder="Your email" 
                                className="w-full px-4 py-2 bg-transparent text-white text-sm focus:outline-none placeholder:text-primary-600"
                            />
                            <button className="px-4 text-accent border-l border-primary-700 hover:bg-accent hover:text-white transition-colors duration-300">
                                →
                            </button>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-primary-800 flex flex-col md:flex-row justify-between items-center text-xs text-primary-500">
                    <p>© 2024 Fahadé. All rights reserved.</p>
                    <p>Crafted with precision in Pakistan</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;