const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

router.get('/', bannerController.getBanners);
router.post('/:id/click', bannerController.trackBannerClick);

module.exports = router;