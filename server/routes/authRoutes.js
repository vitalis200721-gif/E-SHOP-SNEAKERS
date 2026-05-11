const express = require('express');
const passport = require('passport');
const crypto = require('crypto');
const router = express.Router();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  isEmailEnabled,
} = require('../utils/email');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const REQUIRE_EMAIL_VERIFICATION = process.env.REQUIRE_EMAIL_VERIFICATION !== 'false';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

const isProd = process.env.NODE_ENV === 'production';

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 5 : 100,
  message: { message: 'Too many registration attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 10 : 100,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 5 : 50,
  message: { message: 'Too many password reset requests. Try again later.' },
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
  emailVerified: user.emailVerified,
});

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

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
              emailVerified: true,
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            user.avatar = user.avatar || profile.photos?.[0]?.value;
            user.emailVerified = true;
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
  res.json({
    googleEnabled: Boolean(googleConfigured),
    emailEnabled: isEmailEnabled(),
    requireEmailVerification: REQUIRE_EMAIL_VERIFICATION,
  });
});

router.post('/register', registerLimiter, async (req, res) => {
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

    const rawToken = crypto.randomBytes(32).toString('hex');
    const verificationToken = hashToken(rawToken);
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      provider: 'local',
      verificationToken,
      verificationTokenExpires,
      emailVerified: false,
    });

    sendVerificationEmail(user.email, user.name, rawToken).catch(() => {});

    if (REQUIRE_EMAIL_VERIFICATION && isEmailEnabled()) {
      return res.status(201).json({
        user: sanitize(user),
        requiresVerification: true,
        message: 'Check your email to verify your account before signing in.',
      });
    }

    res.status(201).json({
      user: sanitize(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password +loginAttempts +lockUntil'
    );
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isLocked()) {
      const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Account temporarily locked. Try again in ${minutes} minute(s).`,
      });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (REQUIRE_EMAIL_VERIFICATION && isEmailEnabled() && !user.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before signing in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.json({
      user: sanitize(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const hashed = hashToken(req.params.token);
    const user = await User.findOne({
      verificationToken: hashed,
      verificationTokenExpires: { $gt: new Date() },
    }).select('+verificationToken +verificationTokenExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully',
      user: sanitize(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

router.post('/resend-verification', registerLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: 'If an account exists, a verification email has been sent.' });
    }
    if (user.emailVerified) {
      return res.json({ message: 'Email already verified.' });
    }
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = hashToken(rawToken);
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    sendVerificationEmail(user.email, user.name, rawToken).catch(() => {});
    res.json({ message: 'Verification email sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not resend verification email' });
  }
});

router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = hashToken(rawToken);
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      sendPasswordResetEmail(user.email, user.name, rawToken).catch(() => {});
    }
    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not send reset email' });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const hashed = hashToken(req.params.token);
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires +password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.json({
      message: 'Password updated successfully',
      user: sanitize(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed' });
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
