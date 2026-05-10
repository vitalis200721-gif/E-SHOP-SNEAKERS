const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { brand, size, color, minPrice, maxPrice, sort, limit = 20, page = 1, onSale, search } = req.query;

    const query = {};
    if (brand) query.brand = brand;
    if (color) query.color = color;
    if (size) query.sizes = Number(size);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (onSale === 'true') {
      query.oldPrice = { $ne: null, $gt: 0 };
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'price-low') sortQuery = { price: 1 };
    if (sort === 'price-high') sortQuery = { price: -1 };
    if (sort === 'popularity' || sort === 'best-sellers') sortQuery = { salesCount: -1 };

    const lim = Math.min(Number(limit) || 20, 100);
    const products = await Product.find(query)
      .sort(sortQuery)
      .limit(lim)
      .skip((Number(page) - 1) * lim);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      pages: Math.ceil(total / lim),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/recommendations', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.json([]);
    const recommendations = await Product.find({
      brand: product.brand,
      _id: { $ne: product._id },
    }).limit(4);
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      name, brand, price, oldPrice, description, images, sizes,
      color, category, stock, featured, trending,
    } = req.body;

    if (!name || !brand || !price || !description || !color || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const product = await Product.create({
      name, brand,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      description,
      images: Array.isArray(images) ? images : [],
      sizes: Array.isArray(sizes) ? sizes.map(Number) : [],
      color, category,
      stock: Number(stock || 0),
      featured: Boolean(featured),
      trending: Boolean(trending),
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const fields = [
      'name', 'brand', 'price', 'oldPrice', 'description', 'images',
      'sizes', 'color', 'category', 'stock', 'featured', 'trending',
    ];
    const update = {};
    fields.forEach((f) => {
      if (req.body[f] !== undefined) update[f] = req.body[f];
    });
    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
