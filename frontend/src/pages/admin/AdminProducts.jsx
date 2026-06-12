/**
 * ============================================
 * FAHADÉ - Admin Product Management (100% Responsive)
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiSearch, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const initialFormState = {
    name: '', description: '', shortDescription: '', price: '', compareAtPrice: '',
    category: '', brand: 'Fahadé', status: 'active', totalStock: '', 
    isFeatured: false, isTrending: false, isNewArrival: false,
};

const AdminProducts = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [existingImages, setExistingImages] = useState([]);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [variants, setVariants] = useState([]);
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchProducts();
            fetchCategories();
        }
    }, [isAuthenticated, user]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/products');
            setProducts(res.data.data || []);
        } catch (err) {
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    // IMAGE HANDLING
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews(prev => [...prev, ...newPreviews]);
        setNewImageFiles(prev => [...prev, ...files]);
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index) => {
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    // VARIANT HANDLING
    const addClothingSizes = () => {
        setVariants(['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => ({ size, stock: 0, isActive: true })));
    };

    const addShoeSizes = () => {
        setVariants(['6', '7', '8', '9', '10', '11', '12'].map(size => ({ size, stock: 0, isActive: true })));
    };

    const addSingleVariant = () => {
        setVariants([...variants, { size: '', stock: 0, isActive: true }]);
    };

    const removeVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index, field, value) => {
        const updated = [...variants];
        updated[index][field] = field === 'stock' ? Number(value) : value;
        setVariants(updated);
    };

    const clearVariants = () => setVariants([]);

    // EDIT HANDLER
    const handleEdit = (product) => {
        setEditingProductId(product._id);
        setFormData({
            name: product.name || '',
            description: product.description || '',
            shortDescription: product.shortDescription || '',
            price: product.price || '',
            compareAtPrice: product.compareAtPrice || '',
            category: product.category?._id || product.category || '',
            brand: product.brand || 'Fahadé',
            status: product.status || 'active',
            totalStock: product.totalStock || '',
            isFeatured: product.isFeatured || false,
            isTrending: product.isTrending || false,
            isNewArrival: product.isNewArrival || false,
        });
        setExistingImages(product.images || []);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        setVariants(product.variants || []);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingProductId(null);
        setFormData(initialFormState);
        setVariants([]);
        setExistingImages([]);
        setNewImageFiles([]);
        setNewImagePreviews([]);
    };

    // FORM SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) { toast.error('Please login first'); return; }

        try {
            setSubmitting(true);
            const productData = new FormData();
            
            Object.keys(formData).forEach(key => {
                productData.append(key, formData[key]);
            });

            if (variants.length > 0) {
                productData.append('variants', JSON.stringify(variants));
            } else {
                productData.append('variants', '[]');
            }

            if (editingProductId) {
                productData.append('keptImages', JSON.stringify(existingImages));
            }

            newImageFiles.forEach(file => {
                productData.append('images', file);
            });

            if (editingProductId) {
                await api.put(`/admin/products/${editingProductId}`, productData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product updated! ✅');
            } else {
                await api.post('/admin/products', productData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product added! 🎉');
            }

            handleCancelForm();
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save product');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await api.delete(`/admin/products/${id}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    // Filter products by search
    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAuthenticated || !user) {
        return <div className="text-center py-20 text-primary-400">Verifying access...</div>;
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-display text-primary-950">Products</h1>
                <button 
                    onClick={() => { handleCancelForm(); setShowForm(!showForm); }} 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-950 text-white text-xs sm:text-sm font-medium tracking-wider uppercase hover:bg-accent transition-colors"
                >
                    <FiPlus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {/* ============================================
                ADD / EDIT FORM (Responsive)
                ============================================ */}
            {showForm && (
                <div className="bg-white p-4 sm:p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-base sm:text-lg font-display text-primary-950">
                            {editingProductId ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <button onClick={handleCancelForm} className="p-1 hover:bg-gray-100 rounded">
                            <FiX className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

                        {/* Basic Info */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-medium tracking-wider uppercase text-gray-500 mb-3 sm:mb-4 pb-2 border-b">Basic Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Product Name *" className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-primary-900" required />
                                <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand" className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-primary-900" />
                                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price (PKR) *" className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-primary-900" required />
                                <input type="number" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange} placeholder="Compare at Price" className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-primary-900" />
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-primary-900 bg-white" required>
                                    <option value="">Select Category *</option>
                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                                <input type="number" name="totalStock" value={formData.totalStock} onChange={handleChange} placeholder="Total Stock *" className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-primary-900" required />
                                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Full Description *" className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-primary-900 sm:col-span-2 h-20 sm:h-24 resize-none" required />
                            </div>
                            <div className="flex flex-wrap gap-4 sm:gap-6 items-center mt-3 sm:mt-4">
                                <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 accent-primary-900" /> Featured
                                </label>
                                <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleChange} className="w-4 h-4 accent-primary-900" /> Trending
                                </label>
                                <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} className="w-4 h-4 accent-primary-900" /> New Arrival
                                </label>
                            </div>
                        </div>

                        {/* IMAGES SECTION */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-medium tracking-wider uppercase text-gray-500 mb-3 sm:mb-4 pb-2 border-b">
                                Product Images
                                {existingImages.length > 0 && (
                                    <span className="text-accent ml-2">({existingImages.length} existing)</span>
                                )}
                            </h3>
                            
                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-[10px] sm:text-xs text-gray-400 mb-2">Current Images (tap × to remove):</p>
                                    <div className="flex flex-wrap gap-2 sm:gap-3">
                                        {existingImages.map((img, index) => (
                                            <div key={index} className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 border border-gray-200 flex-shrink-0">
                                                <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeExistingImage(index)}
                                                    className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600"
                                                >×</button>
                                                {index === 0 && <span className="absolute bottom-0 left-0 right-0 bg-primary-900 text-white text-[7px] sm:text-[8px] text-center py-0.5">PRIMARY</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Image Previews */}
                            {newImagePreviews.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-[10px] sm:text-xs text-gray-400 mb-2">New Images to Upload:</p>
                                    <div className="flex flex-wrap gap-2 sm:gap-3">
                                        {newImagePreviews.map((preview, index) => (
                                            <div key={index} className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 border border-dashed border-primary-300 flex-shrink-0">
                                                <img src={preview} alt="" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeNewImage(index)}
                                                    className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600"
                                                >×</button>
                                                <span className="absolute bottom-0 left-0 right-0 bg-accent text-white text-[7px] sm:text-[8px] text-center py-0.5">NEW</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload Button */}
                            <div className="border-2 border-dashed border-gray-200 p-4 sm:p-6 text-center hover:border-gray-400 transition-colors">
                                <input type="file" name="images" id="images" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                <label htmlFor="images" className="cursor-pointer">
                                    <FiImage className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-gray-300 mb-2" />
                                    <p className="text-xs sm:text-sm text-gray-600">Click to upload images</p>
                                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">PNG, JPG, WEBP (Max 5MB)</p>
                                </label>
                            </div>
                        </div>

                        {/* VARIANTS */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-medium tracking-wider uppercase text-gray-500 mb-3 sm:mb-4 pb-2 border-b">Size Variants</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <button type="button" onClick={addClothingSizes} className="px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs border border-gray-200 text-gray-700 hover:bg-primary-950 hover:text-white transition-colors">+ Clothing</button>
                                <button type="button" onClick={addShoeSizes} className="px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs border border-gray-200 text-gray-700 hover:bg-primary-950 hover:text-white transition-colors">+ Shoes</button>
                                <button type="button" onClick={addSingleVariant} className="px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs border border-gray-200 text-gray-700 hover:bg-primary-950 hover:text-white transition-colors">+ Custom</button>
                                {variants.length > 0 && <button type="button" onClick={clearVariants} className="px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-colors">Clear All</button>}
                            </div>

                            {variants.length > 0 && (
                                <div className="space-y-2">
                                    {variants.map((variant, index) => (
                                        <div key={index} className="flex items-center gap-2 sm:gap-3 bg-gray-50 p-2.5 sm:p-3">
                                            <span className="text-[10px] sm:text-xs text-gray-400 w-5 sm:w-6">{index + 1}.</span>
                                            <input type="text" value={variant.size} onChange={(e) => updateVariant(index, 'size', e.target.value)} placeholder="Size" className="flex-1 min-w-0 px-2.5 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:border-primary-900" />
                                            <input type="number" value={variant.stock} onChange={(e) => updateVariant(index, 'stock', e.target.value)} placeholder="Stock" className="w-16 sm:w-24 px-2.5 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:border-primary-900" min="0" />
                                            <button type="button" onClick={() => removeVariant(index)} className="text-red-400 hover:text-red-600 p-1"><FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={submitting} className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-primary-950 text-white text-xs sm:text-sm font-medium tracking-wider uppercase hover:bg-accent transition-colors disabled:opacity-50">
                            {submitting ? 'Saving...' : editingProductId ? 'Update Product' : 'Save Product'}
                        </button>
                    </form>
                </div>
            )}

            {/* ============================================
                PRODUCTS LIST (Responsive: Table + Cards)
                ============================================ */}
            
            {/* Search Bar */}
            <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-primary-900"
                />
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400 text-sm">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 sm:py-20 text-gray-400">
                    <FiPackage className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm sm:text-base">No products found</p>
                    <p className="text-xs text-gray-300 mt-1">Click "Add Product" to create one</p>
                </div>
            ) : (
                <>
                    {/* ✅ DESKTOP TABLE (hidden on mobile) */}
                    <div className="hidden md:block bg-white shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] tracking-wider uppercase text-gray-500 font-medium">Image</th>
                                    <th className="px-4 py-3 text-[10px] tracking-wider uppercase text-gray-500 font-medium">Product</th>
                                    <th className="px-4 py-3 text-[10px] tracking-wider uppercase text-gray-500 font-medium">Category</th>
                                    <th className="px-4 py-3 text-[10px] tracking-wider uppercase text-gray-500 font-medium">Price</th>
                                    <th className="px-4 py-3 text-[10px] tracking-wider uppercase text-gray-500 font-medium">Stock</th>
                                    <th className="px-4 py-3 text-[10px] tracking-wider uppercase text-gray-500 font-medium">Status</th>
                                    <th className="px-4 py-3 text-[10px] tracking-wider uppercase text-gray-500 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(p => (
                                    <tr key={p._id} className="border-b hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="w-12 h-12 bg-gray-50 overflow-hidden flex-shrink-0">
                                                {p.images?.[0]?.url ? (
                                                    <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><FiImage className="w-5 h-5" /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{p.name}</p>
                                            <p className="text-[10px] text-gray-400">{p.brand}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{p.category?.name || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">PKR {p.price?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{p.totalStock}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-medium px-2 py-1 rounded ${p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <button onClick={() => handleEdit(p)} className="text-gray-400 hover:text-primary-900 transition-colors" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(p._id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ MOBILE CARDS (hidden on desktop) */}
                    <div className="md:hidden space-y-3">
                        {filteredProducts.map(p => (
                            <div key={p._id} className="bg-white border border-gray-100 p-3 sm:p-4 shadow-sm">
                                <div className="flex gap-3">
                                    {/* Product Image */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 overflow-hidden flex-shrink-0">
                                        {p.images?.[0]?.url ? (
                                            <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><FiImage className="w-6 h-6" /></div>
                                        )}
                                    </div>
                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{p.brand} • {p.category?.name || 'N/A'}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-sm font-bold text-gray-900">PKR {p.price?.toLocaleString()}</p>
                                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <span className="text-[10px] text-gray-400">Stock: {p.totalStock}</span>
                                    <div className="flex gap-4">
                                        <button onClick={() => handleEdit(p)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-900 transition-colors">
                                            <FiEdit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(p._id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors">
                                            <FiTrash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminProducts;