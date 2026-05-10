const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const stripe = process.env.STRIPE_SECRET_KEY
  ? Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const ensureStripe = (req, res, next) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Stripe is not configured on the server' });
  }
  next();
};

router.post('/create-checkout-session', protect, ensureStripe, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const lineItems = order.orderItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: { productId: String(item.product), size: String(item.size || '') },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    if (order.shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(order.shippingPrice * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: req.user.email,
      client_reference_id: String(order._id),
      metadata: { orderId: String(order._id), userId: String(req.user._id) },
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel?order_id=${order._id}`,
    });

    order.paymentResult = {
      ...(order.paymentResult || {}),
      sessionId: session.id,
      status: 'pending',
    };
    order.status = 'processing';
    await order.save();

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ message: err.message });
  }
});

const handleCheckoutSucceeded = async (session) => {
  const orderId = session.metadata?.orderId || session.client_reference_id;
  if (!orderId) return;
  const order = await Order.findById(orderId);
  if (!order || order.isPaid) return;

  order.isPaid = true;
  order.paidAt = new Date();
  order.status = 'paid';
  order.paymentResult = {
    id: session.id,
    sessionId: session.id,
    paymentIntentId: session.payment_intent,
    status: session.payment_status,
    email_address: session.customer_details?.email,
  };
  await order.save();
  console.log(`Order ${orderId} marked as paid`);
};

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe) return res.status(503).end();
    const sig = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      if (secret) {
        event = stripe.webhooks.constructEvent(req.body, sig, secret);
      } else {
        event = JSON.parse(req.body.toString());
        console.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification (DEV ONLY)');
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          await handleCheckoutSucceeded(event.data.object);
          break;
        }
        case 'checkout.session.async_payment_succeeded': {
          await handleCheckoutSucceeded(event.data.object);
          break;
        }
        case 'payment_intent.payment_failed': {
          const intent = event.data.object;
          const orderId = intent.metadata?.orderId;
          if (orderId) {
            await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });
          }
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error('Webhook handler error:', err);
      return res.status(500).send('Webhook handler failed');
    }
    res.json({ received: true });
  }
);

router.get('/session/:id', protect, ensureStripe, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    res.json({
      payment_status: session.payment_status,
      status: session.status,
      amount_total: session.amount_total,
      customer_email: session.customer_details?.email,
      orderId: session.metadata?.orderId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
