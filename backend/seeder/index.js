/**
 * ============================================
 * FAHADÉ - Database Seeder (FIXED)
 * ============================================
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const slugify = require('slugify'); // ✅ Slugify import kiya

// Models
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');

// ============================================
// SEED DATA (WITH SLUGS)
// ============================================

const categories = [
    { name: 'Men', slug: 'men', description: "Men's Fashion", sortOrder: 1, image: '/uploads/men.jpg' },
    { name: 'Women', slug: 'women', description: "Women's Fashion", sortOrder: 2, image: '/uploads/women.jpg' },
    { name: 'Watches', slug: 'watches', description: 'Luxury Watches', sortOrder: 3, image: '/uploads/watches.jpg' },
    { name: 'Shoes', slug: 'shoes', description: 'Premium Footwear', sortOrder: 4, image: '/uploads/shoes.jpg' },
    { name: 'Accessories', slug: 'accessories', description: 'Bags, Belts & More', sortOrder: 5, image: '/uploads/accessories.jpg' },
];

// const products = [
//     {
//         name: 'Fahadé Classic Black Hoodie',
//         slug: 'fhade-classic-black-hoodie',
//         description: 'Premium cotton hoodie with a luxury feel. Embroidered logo. Perfect for winter evenings.',
//         shortDescription: 'Premium cotton black hoodie',
//         price: 4500,
//         compareAtPrice: 6000,
//         brand: 'Fahadé',
//         status: 'active',
//         isFeatured: true,
//         isTrending: true,
//         totalStock: 50,
//         specifications: [{ label: 'Material', value: '100% Premium Cotton' }, { label: 'Fit', value: 'Regular' }],
//         images: [{ url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', alt: 'Black Hoodie', isPrimary: true, sortOrder: 1 }],
//         flashSale: { isActive: true, salePrice: 3500, startDate: new Date(Date.now() - 1 * 60 * 60 * 1000), endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), maxQuantityPerUser: 2 },
//     },
//     {
//         name: 'Minimalist White T-Shirt',
//         slug: 'minimalist-white-t-shirt',
//         description: 'Ultra-soft premium white t-shirt with a clean minimal design.',
//         shortDescription: 'Premium white minimal t-shirt',
//         price: 2200,
//         compareAtPrice: 2800,
//         brand: 'Fahadé Basics',
//         status: 'active',
//         isNewArrival: true,
//         totalStock: 200,
//         images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', alt: 'White T-Shirt', isPrimary: true, sortOrder: 1 }],
//     },
//     {
//         name: 'Royal Chronograph Watch',
//         slug: 'royal-chronograph-watch',
//         description: 'Stainless steel luxury chronograph watch with sapphire crystal glass. Water resistant up to 50m.',
//         shortDescription: 'Luxury stainless steel watch',
//         price: 25000,
//         compareAtPrice: 32000,
//         brand: 'Fahadé Timepieces',
//         status: 'active',
//         isFeatured: true,
//         isTrending: true,
//         totalStock: 15,
//         specifications: [{ label: 'Movement', value: 'Japanese Quartz' }, { label: 'Glass', value: 'Sapphire Crystal' }],
//         images: [{ url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80', alt: 'Luxury Watch', isPrimary: true, sortOrder: 1 }],
//     },
//     {
//         name: 'Silver Diamond Dial Watch',
//         slug: 'silver-diamond-dial-watch',
//         description: 'Elegant silver tone watch with diamond-studded dial for a sophisticated look.',
//         shortDescription: 'Elegant silver diamond watch',
//         price: 45000,
//         compareAtPrice: 55000,
//         brand: 'Fahadé Timepieces',
//         status: 'active',
//         isFeatured: true,
//         totalStock: 8,
//         images: [{ url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80', alt: 'Silver Watch', isPrimary: true, sortOrder: 1 }],
//     },
//     {
//         name: 'Urban Runner Pro - Sneakers',
//         slug: 'urban-runner-pro-sneakers',
//         description: 'Lightweight running sneakers with memory foam insole and breathable mesh upper.',
//         shortDescription: 'Lightweight running sneakers',
//         price: 8500,
//         compareAtPrice: 10000,
//         brand: 'Fahadé Active',
//         status: 'active',
//         isTrending: true,
//         totalStock: 80,
//         specifications: [{ label: 'Sole', value: 'Rubber Grip' }, { label: 'Closure', value: 'Lace-up' }],
//         images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', alt: 'Red Sneakers', isPrimary: true, sortOrder: 1 }],
//         flashSale: { isActive: true, salePrice: 5999, startDate: new Date(Date.now() - 2 * 60 * 60 * 1000), endDate: new Date(Date.now() + 48 * 60 * 60 * 1000), maxQuantityPerUser: 1 },
//     },
//     {
//         name: 'Classic Leather Oxford Shoes',
//         slug: 'classic-leather-oxford-shoes',
//         description: 'Hand-polished genuine leather oxford shoes for formal occasions.',
//         shortDescription: 'Premium leather oxford shoes',
//         price: 15000,
//         compareAtPrice: 18000,
//         brand: 'Fahadé',
//         status: 'active',
//         totalStock: 30,
//         images: [{ url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80', alt: 'Oxford Shoes', isPrimary: true, sortOrder: 1 }],
//     },
//     {
//         name: 'Leather Voyager Duffle Bag',
//         slug: 'leather-voyager-duffle-bag',
//         description: 'Handcrafted genuine leather duffle bag for travel. Spacious interior with multiple pockets.',
//         shortDescription: 'Genuine leather duffle bag',
//         price: 18000,
//         compareAtPrice: 22000,
//         brand: 'Fahadé',
//         status: 'active',
//         isFeatured: true,
//         totalStock: 20,
//         specifications: [{ label: 'Material', value: 'Genuine Leather' }, { label: 'Capacity', value: '45L' }],
//         images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', alt: 'Leather Bag', isPrimary: true, sortOrder: 1 }],
//     },
//     {
//         name: 'Aviator Gold Sunglasses',
//         slug: 'aviator-gold-sunglasses',
//         description: 'Premium UV-protection aviator sunglasses with gold frame and crystal lenses.',
//         shortDescription: 'Gold aviator sunglasses',
//         price: 6500,
//         compareAtPrice: 8000,
//         brand: 'Fahadé Eyewear',
//         status: 'active',
//         isTrending: true,
//         totalStock: 45,
//         images: [{ url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', alt: 'Sunglasses', isPrimary: true, sortOrder: 1 }],
//     },
// ];

const banners = [
    {
        title: 'Winter Collection 2024',
        subtitle: 'Redefine Luxury',
        description: 'Explore the latest premium winter wear by Fahadé.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80',
        ctaText: 'Shop Now',
        ctaLink: '/products?category=men',
        position: 'hero',
        sortOrder: 1,
        isActive: true,
    },
    {
        title: 'Flash Sale - 50% Off',
        subtitle: 'Limited Time Only',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
        ctaText: 'Grab Deals',
        ctaLink: '/products?flashSale=true',
        position: 'middle',
        sortOrder: 2,
        isActive: true,
    },
];

// ============================================
// SEED EXECUTION FUNCTION
// ============================================

const seedDB = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        // ========================================
        // CLEAR EXISTING DATA
        // ========================================
        console.log('🗑️ Clearing old data...');
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Banner.deleteMany({});
        await Coupon.deleteMany({});

        // ========================================
        // CREATE ADMIN USER (.create() triggers password hashing)
        // ========================================
        console.log('👑 Creating Admin User...');
        await User.create({
            name: 'Fahad Admin',
            email: process.env.ADMIN_EMAIL || 'admin@fahade.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@1234',
            role: 'admin',
            isEmailVerified: true,
            isActive: true,
        });

        // ========================================
        // CREATE SUPPLIER USER
        // ========================================
        console.log('🏭 Creating Supplier User...');
        await User.create({
            name: 'Fahadé Supplier',
            email: 'supplier@fahade.com',
            password: process.env.ADMIN_PASSWORD || 'Supplier@1234',
            role: 'supplier', // ✅ Supplier Role
            isEmailVerified: true,
            isActive: true,
        });

        // ========================================
        // CREATE CATEGORIES
        // ========================================
        console.log('📁 Creating Categories...');
        const createdCategories = await Category.insertMany(categories);

        // ========================================
        // CREATE PRODUCTS (Assign categories & images)
        // ========================================
        // console.log('📦 Creating Products...');
        // const productsWithCategories = products.map(product => {
        //     // Assign specific category based on product name
        //     let targetCategory;
        //     if (product.name.toLowerCase().includes('watch')) {
        //         targetCategory = createdCategories.find(c => c.name === 'Watches');
        //     } else if (product.name.toLowerCase().includes('sneaker') || product.name.toLowerCase().includes('shoes')) {
        //         targetCategory = createdCategories.find(c => c.name === 'Shoes');
        //     } else if (product.name.toLowerCase().includes('bag')) {
        //         targetCategory = createdCategories.find(c => c.name === 'Accessories');
        //     } else {
        //         targetCategory = createdCategories.find(c => c.name === 'Men'); // Default
        //     }

        //     if (!targetCategory) targetCategory = createdCategories[0]; // Fallback
        //     product.category = targetCategory._id;

            // Add dummy image URLs
        //     product.images = [{
        //         url: `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80`,
        //         alt: product.name,
        //         isPrimary: true,
        //         sortOrder: 1,
        //     }];

        //     // Add variants for clothing/shoes
        //     if (product.totalStock > 20) {
        //         product.variants = [
        //             { size: 'S', stock: Math.floor(product.totalStock / 4), isActive: true },
        //             { size: 'M', stock: Math.floor(product.totalStock / 4), isActive: true },
        //             { size: 'L', stock: Math.floor(product.totalStock / 4), isActive: true },
        //             { size: 'XL', stock: Math.floor(product.totalStock / 4), isActive: true },
        //         ];
        //     }

        //     return product;
        // });
        // await Product.insertMany(productsWithCategories);

        // ========================================
        // CREATE BANNERS
        // ========================================
        console.log('🖼️ Creating Banners...');
        await Banner.insertMany(banners);

        // ========================================
        // CREATE SAMPLE COUPON
        // ========================================
        console.log('🎟️ Creating Sample Coupon...');
        await Coupon.create({
            code: 'WELCOME10',
            description: '10% off on your first order',
            discountType: 'percentage',
            discountValue: 10,
            maxDiscountAmount: 2000,
            minOrderValue: 3000,
            usageLimit: 100,
            perUserLimit: 1,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            isActive: true,
        });

        console.log(`
        ╔══════════════════════════════════════╗
        ║   ✅ DATABASE SEEDED SUCCESSFULLY   ║
        ║                                     ║
        ║   👑 Admin: ${process.env.ADMIN_EMAIL || 'admin@fahade.com'}
        ║   🔑 Pass: ${process.env.ADMIN_PASSWORD || 'Admin@1234'}
        ║   🎟️ Coupon: WELCOME10 (10% off)   ║
        ╚══════════════════════════════════════╝
        `);

        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

// Run Seeder
seedDB();