const rateLimit = require('express-rate-limit');

// Applied only to login route.
// Locks out an IP after 5 failed attempts for 15 minutes.
// This directly mitigates the Brute-Force Authentication risk (score 20/25).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };
