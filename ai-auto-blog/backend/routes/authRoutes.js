const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// In-Memory Brute-Force Rate Limiter (Max 5 failed attempts per 15 minutes per IP)
const failedAttempts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

// Clean up expired tracking keys periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of failedAttempts.entries()) {
    if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
      failedAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

router.post('/login', async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown-ip';
  const now = Date.now();

  const ipRecord = failedAttempts.get(ip);
  if (ipRecord) {
    if (now - ipRecord.firstAttempt > RATE_LIMIT_WINDOW_MS) {
      failedAttempts.delete(ip);
    } else if (ipRecord.count >= MAX_FAILED_ATTEMPTS) {
      const remainingMins = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - ipRecord.firstAttempt)) / 60000);
      return res.status(429).json({ 
        message: `Too many failed login attempts. Your IP has been temporarily locked for security. Please try again in ${remainingMins} minute(s).` 
      });
    }
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      // Record failed attempt
      const current = failedAttempts.get(ip) || { count: 0, firstAttempt: now };
      current.count += 1;
      failedAttempts.set(ip, current);

      const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - current.count);
      return res.status(401).json({ 
        message: remaining > 0 
          ? `Invalid credentials. ${remaining} attempt(s) remaining before temporary lockout.`
          : `Invalid credentials. Account locked for 15 minutes due to too many failed attempts.`
      });
    }

    // Reset failed attempts on successful login
    failedAttempts.delete(ip);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
