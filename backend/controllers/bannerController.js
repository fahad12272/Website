/**
 * ============================================
 * FAHADÉ - Banner Controller
 * ============================================
 */

const Banner = require('../models/Banner');

// GET ACTIVE BANNERS (Public)
exports.getBanners = async (req, res, next) => {
    try {
        const { position } = req.query;
        const now = new Date();

        const filter = {
            isActive: true,
            startDate: { $lte: now },
            $or: [
                { endDate: null },
                { endDate: { $gte: now } },
            ],
        };

        if (position) filter.position = position;

        const banners = await Banner.find(filter)
            .sort({ sortOrder: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            data: banners,
        });

    } catch (error) {
        next(error);
    }
};

// TRACK BANNER CLICK
exports.trackBannerClick = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Banner.findByIdAndUpdate(id, { $inc: { clickCount: 1 } });
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};