/**
 * ============================================
 * FAHADÉ - Admin Category Management (100% Responsive)
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiFolder } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminCategories = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [existingImage, setExistingImage] = useState('');

    useEffect(() => {
        if (isAuthenticated && user) fetchCategories();
    }, [isAuthenticated, user]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/categories');
            setCategories(res.data.data || []);
        } catch (err) {
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setExistingImage('');
        }
    };

    const handleEdit = (cat) => {
        setEditingId(cat._id);
        setFormData({ name: cat.name, description: cat.description || '' });
        setExistingImage(cat.image || '');
        setImageFile(null);
        setImagePreview('');
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', description: '' });
        setImageFile(null);
        setImagePreview('');
        setExistingImage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const catData = new FormData();
            catData.append('name', formData.name);
            catData.append('description', formData.description);
            if (imageFile) {
                catData.append('image', imageFile);
            }

            if (editingId) {
                await api.put(`/admin/categories/${editingId}`, catData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Category updated!');
            } else {
                await api.post('/admin/categories', catData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Category added!');
            }
            handleCancel();
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            toast.success('Deleted');
            fetchCategories();
        } catch (err) {
            toast.error('Failed');
        }
    };

    if (!isAuthenticated) return <div className="text-center py-20 text-gray-400 text-sm">Verifying access...</div>;
    if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Loading categories...</div>;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-display text-primary-950">Categories</h1>
                <button 
                    onClick={() => { handleCancel(); setShowForm(!showForm); }} 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-950 text-white text-xs sm:text-sm font-medium tracking-wider uppercase hover:bg-accent transition-colors w-full sm:w-auto"
                >
                    <FiPlus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add Category'}
                </button>
            </div>

            {/* ADD / EDIT FORM */}
            {showForm && (
                <div className="bg-white p-4 sm:p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-base sm:text-lg font-display text-primary-950">
                            {editingId ? 'Edit Category' : 'Add Category'}
                        </h2>
                        <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded">
                            <FiX className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="Category Name *" 
                                className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-primary-900" 
                                required 
                            />
                            <input 
                                type="text" 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Description" 
                                className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-primary-900" 
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="text-[10px] sm:text-xs tracking-wider uppercase text-gray-500 block mb-2">Category Image</label>
                            
                            {(existingImage || imagePreview) && (
                                <div className="mb-3 flex items-start gap-3">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={imagePreview || existingImage} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => { setExistingImage(''); setImageFile(null); setImagePreview(''); }}
                                        className="text-[10px] sm:text-xs text-red-500 hover:underline"
                                    >
                                        Remove image
                                    </button>
                                </div>
                            )}

                            <div className="border-2 border-dashed border-gray-200 p-3 sm:p-4 text-center hover:border-gray-400 transition-colors">
                                <input 
                                    type="file" 
                                    name="image" 
                                    id="catImage" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <label htmlFor="catImage" className="cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
                                    <FiImage className="w-4 h-4 sm:w-5 sm:h-5" /> 
                                    {existingImage ? 'Change Image' : 'Upload Image'}
                                </label>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-primary-950 text-white text-xs sm:text-sm font-medium tracking-wider uppercase hover:bg-accent transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : editingId ? 'Update Category' : 'Save Category'}
                        </button>
                    </form>
                </div>
            )}

            {/* ============================================
                CATEGORIES LIST (Fixed Layout)
                ============================================ */}
            {categories.length === 0 ? (
                <div className="text-center py-16 sm:py-20 text-gray-400">
                    <FiFolder className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm sm:text-base">No categories yet</p>
                    <p className="text-xs text-gray-300 mt-1">Click "Add Category" to create one</p>
                </div>
            ) : (
                /* ✅ FIXED: 2 cols mobile, 3 cols tablet, 4 cols desktop with max-width */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {categories.map(cat => (
                        <div key={cat._id} className="bg-white border border-gray-100 shadow-sm group relative overflow-hidden">
                            {/* Image */}
                            <div className="aspect-square bg-gray-50 overflow-hidden">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <span className="text-3xl sm:text-4xl font-display text-gray-200">{cat.name.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Info + Actions */}
                            <div className="p-3 sm:p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{cat.name}</h3>
                                        <p className="text-[10px] sm:text-xs text-gray-400 capitalize truncate">{cat.slug}</p>
                                    </div>
                                    {/* ✅ FIXED: Actions always visible, better layout */}
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button 
                                            onClick={() => handleEdit(cat)} 
                                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-primary-900 hover:bg-gray-100 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <FiEdit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(cat._id)} 
                                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <FiTrash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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

export default AdminCategories;