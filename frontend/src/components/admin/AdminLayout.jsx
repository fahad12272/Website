import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { FiGrid, FiShoppingBag, FiPackage, FiUsers, FiTag, FiImage, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const AdminLayout = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { name: 'Dashboard', icon: FiGrid, path: '/admin', roles: ['admin', 'supplier'] },
        { name: 'Products', icon: FiShoppingBag, path: '/admin/products', roles: ['admin', 'supplier'] },
        { name: 'Orders', icon: FiPackage, path: '/admin/orders', roles: ['admin', 'supplier'] },
        { name: 'Categories', icon: FiTag, path: '/admin/categories', roles: ['admin'] },
        { name: 'Users', icon: FiUsers, path: '/admin/users', roles: ['admin'] },
        { name: 'Banners', icon: FiImage, path: '/admin/banners', roles: ['admin'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 z-50 h-screen w-64 bg-[#0a0a0a] text-white flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="h-14 flex items-center justify-between px-5 border-b border-[#262626]">
                    <Link to="/admin" className="text-lg font-display tracking-[0.2em] uppercase" onClick={() => setSidebarOpen(false)}>Fahadé</Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white"><FiX className="w-5 h-5" /></button>
                </div>
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {filteredMenu.map((item) => (
                        <Link key={item.name} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${isActive(item.path) ? 'bg-[#262626] text-white' : 'text-[#a3a3a3] hover:bg-[#171717] hover:text-white'}`}>
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-3 border-t border-[#262626]">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-[#a3a3a3] hover:bg-red-900/50 hover:text-red-200 transition-colors w-full">
                        <FiLogOut className="w-5 h-5 shrink-0" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content - calc() ensures EXACT full width */}
            <div className="lg:ml-64 min-h-screen flex flex-col" style={{ width: 'calc(100% - 0px)' }}>
                <style>{`
                    @media (min-width: 1024px) {
                        .admin-content { width: calc(100% - 256px) !important; }
                    }
                `}</style>
                <div className="admin-content w-full min-h-screen flex flex-col">
                    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-30">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 mr-2 text-gray-900 hover:bg-gray-100 rounded"><FiMenu className="w-5 h-5" /></button>
                        <div className="ml-auto flex items-center gap-3">
                            <span className="hidden sm:block text-xs font-medium text-gray-500 capitalize">{user?.role} Panel</span>
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 font-semibold text-xs">{user?.name?.charAt(0)}</div>
                        </div>
                    </header>
                    <main className="flex-1 p-4 sm:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;