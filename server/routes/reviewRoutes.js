const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  const { productId, rating, comment } = req.body;
  try {
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
      userName: req.user.name,
    });

    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { rating: avgRating, reviews: reviews.length });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
