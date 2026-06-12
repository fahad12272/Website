/**
 * ============================================
 * FAHADÉ - Admin Banner Management (100% Responsive)
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiLayout, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminBanners = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        ctaText: 'Shop Now',
        ctaLink: '',
        position: 'hero',
        textPosition: 'center',
        sortOrder: 0,
        isActive: true,
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [existingImage, setExistingImage] = useState('');

    useEffect(() => {
        if (isAuthenticated && user) fetchBanners();
    }, [isAuthenticated, user]);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/banners');
            setBanners(res.data.data || []);
        } catch (err) {
            toast.error('Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setExistingImage('');
        }
    };

    const handleEdit = (banner) => {
        setEditingId(banner._id);
        setFormData({
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            ctaText: banner.ctaText || 'Shop Now',
            ctaLink: banner.ctaLink || '',
            position: banner.position || 'hero',
            textPosition: banner.textPosition || 'center',
            sortOrder: banner.sortOrder || 0,
            isActive: banner.isActive !== undefined ? banner.isActive : true,
        });
        setExistingImage(banner.image || '');
        setImageFile(null);
        setImagePreview('');
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            title: '', subtitle: '', ctaText: 'Shop Now', ctaLink: '',
            position: 'hero', textPosition: 'center', sortOrder: 0, isActive: true,
        });
        setImageFile(null);
        setImagePreview('');
        setExistingImage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const bannerData = new FormData();
            Object.keys(formData).forEach(key => {
                bannerData.append(key, formData[key]);
            });
            if (imageFile) {
                bannerData.append('image', imageFile);
            }

            if (editingId) {
                await api.put(`/admin/banners/${editingId}`, bannerData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Banner updated!');
            } else {
                await api.post('/admin/banners', bannerData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Banner added!');
            }
            handleCancel();
            fetchBanners();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save banner');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            await api.delete(`/admin/banners/${id}`);
            toast.success('Banner deleted');
            fetchBanners();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const toggleActive = async (banner) => {
        try {
            await api.put(`/admin/banners/${banner._id}`, { isActive: !banner.isActive });
            toast.success(banner.isActive ? 'Banner deactivated' : 'Banner activated');
            fetchBanners();
        } catch (err) {
            toast.error('Failed to update');
        }
    };

    if (!isAuthenticated || !user) {
        return <div className="text-center py-20 text-gray-400 text-sm">Verifying access...</div>;
    }

    if (loading) {
        return <div className="text-center py-20 text-gray-400 text-sm">Loading banners...</div>;
    }

    const positionLabels = {
        hero: 'Hero Banner',
        top: 'Top Bar',
        middle: 'Middle Section',
        bottom: 'Bottom Section',
        sidebar: 'Sidebar',
    };

    const positionColors = {
        hero: 'bg-purple-100 text-purple-700',
        top: 'bg-blue-100 text-blue-700',
        middle: 'bg-green-100 text-green-700',
        bottom: 'bg-yellow-100 text-yellow-700',
        sidebar: 'bg-gray-100 text-gray-700',
    };

    return (
        <div className="space-y-4 sm:space-y-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-display text-primary-950">Banners</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{banners.length} total banners</p>
                </div>
                <button
                    onClick={() => { handleCancel(); setShowForm(!showForm); }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-950 text-white text-xs sm:text-sm font-medium tracking-wider uppercase hover:bg-accent transition-colors w-full sm:w-auto"
                >
                    <FiPlus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add Banner'}
                </button>
            </div>

            {/* ADD / EDIT FORM */}
            {showForm && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-base sm:text-lg font-display text-primary-950">{editingId ? 'Edit Banner' : 'Add Banner'}</h2>
                        <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded"><FiX className="w-5 h-5 text-gray-500" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Banner Title *" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-900" required />
                            <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="Subtitle" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-900" />
                            <input type="text" name="ctaText" value={formData.ctaText} onChange={handleChange} placeholder="Button Text" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-900" />
                            <input type="text" name="ctaLink" value={formData.ctaLink} onChange={handleChange} placeholder="Button Link (e.g., /products)" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-900" />
                            <select name="position" value={formData.position} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-900 bg-white">
                                <option value="hero">Hero Banner</option>
                                <option value="top">Top Bar</option>
                                <option value="middle">Middle Section</option>
                                <option value="bottom">Bottom Section</option>
                                <option value="sidebar">Sidebar</option>
                            </select>
                            <select name="textPosition" value={formData.textPosition} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-900 bg-white">
                                <option value="left">Text Left</option>
                                <option value="center">Text Center</option>
                                <option value="right">Text Right</option>
                            </select>
                            <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} placeholder="Sort Order" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-900" min="0" />
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 accent-primary-900" /> Active
                            </label>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="text-[10px] sm:text-xs tracking-wider uppercase text-gray-500 block mb-2">Banner Image</label>
                            {(existingImage || imagePreview) && (
                                <div className="mb-3">
                                    <div className="w-full h-32 sm:h-48 bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
                                        <img src={imagePreview || existingImage} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}
                            <div className="border-2 border-dashed border-gray-200 p-3 sm:p-4 text-center hover:border-gray-400 transition-colors rounded-md">
                                <input type="file" name="image" id="bannerImage" accept="image/*" onChange={handleImageChange} className="hidden" />
                                <label htmlFor="bannerImage" className="cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
                                    <FiImage className="w-4 h-4 sm:w-5 sm:h-5" />
                                    {existingImage ? 'Change Image' : 'Upload Banner Image'}
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-primary-950 text-white text-xs sm:text-sm font-medium tracking-wider uppercase hover:bg-accent transition-colors disabled:opacity-50 rounded-md">
                            {submitting ? 'Saving...' : editingId ? 'Update Banner' : 'Save Banner'}
                        </button>
                    </form>
                </div>
            )}

            {/* Banners Grid */}
            {banners.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg py-16 sm:py-20 text-center">
                    <FiLayout className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-200" />
                    <p className="text-base sm:text-lg font-medium text-gray-400">No banners yet</p>
                    <p className="text-xs sm:text-sm text-gray-300 mt-2">Click "Add Banner" to create one</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {banners.map(banner => (
                        <div key={banner._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
                            {/* Banner Preview */}
                            <div className="relative aspect-[2/1] bg-gray-50">
                                {banner.image ? (
                                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FiImage className="w-8 h-8 text-gray-200" />
                                    </div>
                                )}
                                {/* Status Badge */}
                                <div className="absolute top-2 left-2">
                                    <span className={`text-[9px] font-semibold px-2 py-1 rounded ${banner.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {banner.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {/* Position Badge */}
                                <div className="absolute top-2 right-2">
                                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${positionColors[banner.position] || 'bg-gray-100 text-gray-600'}`}>
                                        {positionLabels[banner.position] || banner.position}
                                    </span>
                                </div>
                            </div>
                            {/* Info */}
                            <div className="p-3 sm:p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">{banner.title || 'Untitled'}</h3>
                                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{banner.subtitle || 'No subtitle'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <span className="text-[10px] text-gray-400">Order: {banner.sortOrder}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => toggleActive(banner)} className={`p-1.5 rounded transition-colors ${banner.isActive ? 'text-green-500 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`} title={banner.isActive ? 'Deactivate' : 'Activate'}>
                                            {banner.isActive ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
                                        </button>
                                        <button onClick={() => handleEdit(banner)} className="p-1.5 text-gray-400 hover:text-primary-900 hover:bg-gray-50 rounded transition-colors" title="Edit">
                                            <FiEdit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDelete(banner._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                            <FiTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminBanners;