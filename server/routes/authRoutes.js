const express = require('express');
const passport = require('passport');
const router = express.Router();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  provider: user.provider,
});

const googleConfigured =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  !process.env.GOOGLE_CLIENT_ID.startsWith('your_');

if (googleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
          });
          if (!user) {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos?.[0]?.value,
              provider: 'google',
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            user.avatar = user.avatar || profile.photos?.[0]?.value;
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

router.get('/config', (req, res) => {
  res.json({ googleEnabled: Boolean(googleConfigured) });
});

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    const user = await User.create({ name, email, password, provider: 'local' });
    res.status(201).json({
      user: sanitize(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      user: sanitize(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ user: sanitize(req.user) });
});

router.put('/me', protect, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    if (name) req.user.name = name;
    if (avatar !== undefined) req.user.avatar = avatar;
    await req.user.save();
    res.json({ user: sanitize(req.user) });
  } catch (err) {
    res.status(500).json({ message: 'Profile update failed' });
  }
});

router.get('/google', (req, res, next) => {
  if (!googleConfigured) {
    return res.redirect(`${CLIENT_URL}/?auth_error=google_not_configured`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!googleConfigured) {
      return res.redirect(`${CLIENT_URL}/?auth_error=google_not_configured`);
    }
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${CLIENT_URL}/?auth_error=google_failed`,
    })(req, res, next);
  },
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${CLIENT_URL}/?token=${encodeURIComponent(token)}`);
  }
);

router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.wishlist.map(String).includes(req.params.productId)) {
      user.wishlist.push(req.params.productId);
      await user.save();
    }
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
