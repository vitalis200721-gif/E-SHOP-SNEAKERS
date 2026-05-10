const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const TAX_RATE = 0.0;
const FREE_SHIPPING_THRESHOLD = 150;
const FLAT_SHIPPING = 9.99;

const calcTotals = (items) => {
  const itemsPrice = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const taxPrice = +(itemsPrice * TAX_RATE).toFixed(2);
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const totalPrice = +(itemsPrice + taxPrice + shippingPrice).toFixed(2);
  return { itemsPrice: +itemsPrice.toFixed(2), taxPrice, shippingPrice, totalPrice };
};

router.post('/check-stock', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: 'Invalid items' });
    for (const item of items) {
      const product = await Product.findById(item.product || item._id);
      if (!product || product.stock < (item.qty || 1)) {
        return res.json({
          available: false,
          message: `${product?.name || 'Item'} is out of stock`,
        });
      }
    }
    res.json({ available: true });
  } catch (err) {
    res.status(500).json({ message: 'Stock check failed' });
  }
});

router.post('/', protect, async (req, res) => {
  const decrementedItems = [];
  try {
    const { orderItems, shippingAddress, paymentMethod = 'stripe', couponCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.country) {
      return res.status(400).json({ message: 'Shipping address incomplete' });
    }

    const productIds = orderItems.map((i) => i.product || i._id);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const verifiedItems = [];
    for (const item of orderItems) {
      const id = String(item.product || item._id);
      const product = productMap.get(id);
      if (!product) {
        return res.status(404).json({ message: `Product ${id} not found` });
      }
      const qty = Math.max(1, parseInt(item.qty || item.quantity || 1, 10));
      if (product.stock < qty) {
        return res.status(409).json({ message: `${product.name} is out of stock` });
      }
      verifiedItems.push({
        name: product.name,
        qty,
        price: product.price,
        image: product.images?.[0] || '',
        size: item.size || null,
        product: product._id,
      });
    }

    const totals = calcTotals(verifiedItems);
    let { itemsPrice, taxPrice, shippingPrice, totalPrice } = totals;

    if (couponCode === 'SOLE20') {
      totalPrice = +(totalPrice * 0.8).toFixed(2);
    }

    for (const item of verifiedItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty, salesCount: item.qty } },
        { new: true }
      );
      if (!updated) {
        for (const prev of decrementedItems) {
          await Product.findByIdAndUpdate(prev.product, {
            $inc: { stock: prev.qty, salesCount: -prev.qty },
          });
        }
        return res.status(409).json({ message: `${item.name} just sold out` });
      }
      decrementedItems.push(item);
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems: verifiedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (err) {
    for (const prev of decrementedItems) {
      await Product.findByIdAndUpdate(prev.product, {
        $inc: { stock: prev.qty, salesCount: -prev.qty },
      }).catch(() => {});
    }
    console.error('Order create error:', err);
    res.status(500).json({ message: err.message || 'Order creation failed' });
  }
});

router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load orders' });
  }
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load orders' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (
      String(order.user._id) !== String(req.user._id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load order' });
  }
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const allowed = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
    const { status, trackingNumber, carrier } = req.body;
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;

    if (status === 'paid' && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    const saved = await order.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
