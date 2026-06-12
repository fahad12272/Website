/**
 * ============================================
 * FAHADÉ - Login Page
 * ============================================
 * Minimal luxury login with email & password.
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Show error toast
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(login(formData));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4">
            <div className="w-full max-w-md">
                {/* Brand Logo */}
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block">
                        <h1 className="text-4xl font-display tracking-[0.3em] text-primary-950 uppercase">Fahadé</h1>
                    </Link>
                    <p className="mt-3 text-sm text-primary-500 tracking-wider">WELCOME BACK</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 shadow-sm">
                    <h2 className="text-2xl font-display text-primary-950 mb-8">Sign In</h2>

                    {/* Email */}
                    <div className="mb-6">
                        <label className="text-xs tracking-wider uppercase text-primary-500 block mb-2">Email Address</label>
                        <div className="flex items-center border-b border-primary-200 focus-within:border-primary-900 transition-colors">
                            <FiMail className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0" />
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full py-3 bg-transparent focus:outline-none text-primary-900 placeholder:text-primary-300"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-8">
                        <label className="text-xs tracking-wider uppercase text-primary-500 block mb-2">Password</label>
                        <div className="flex items-center border-b border-primary-200 focus-within:border-primary-900 transition-colors">
                            <FiLock className="w-5 h-5 text-primary-400 mr-3 flex-shrink-0" />
                            <input 
                                type="password" 
                                name="password" 
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full py-3 bg-transparent focus:outline-none text-primary-900 placeholder:text-primary-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary-950 text-white text-sm font-medium tracking-widest uppercase hover:bg-accent transition-colors duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Signing In...' : <>Sign In <FiArrowRight /></>}
                    </button>

                    {/* Register Link */}
                    <p className="text-center text-sm text-primary-500 mt-8">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-900 font-medium hover:text-accent transition-colors underline">
                            Create Account
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;