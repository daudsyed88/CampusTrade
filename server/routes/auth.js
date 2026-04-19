const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { loginLimiter } = require('../middleware/rateLimiter');
const { isUserAdmin } = require('../utils/authz');
const { getClientIp } = require('../utils/request');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

// ---------- REGISTER ----------
// Security controls implemented here:
// 1. .edu email domain enforcement (Spoofing defense in STRIDE)
// 2. bcrypt hashing with saltRounds=12 (Broken Authentication defense)
// 3. Input validation via express-validator
// 4. Duplicate email check returns generic message (prevents user enumeration)
router.post(
  '/register',
  [
    body('email')
      .isEmail().withMessage('Must be a valid email.')
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu(\.[a-zA-Z]{2,})?$/)
      .withMessage('Registration requires a valid institutional .edu email (e.g. .edu or .edu.pk).'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
      .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
    body('displayName')
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Display name must be 2–50 characters.'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, displayName } = req.body;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        // Generic message prevents attackers from knowing if an email is registered
        return res.status(400).json({ error: 'Registration failed. Please check your details.' });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await prisma.user.create({
        data: { email, passwordHash, displayName },
      });

      // Log the registration event in audit table
      await prisma.auditLog.create({
        data: { userId: user.id, action: 'REGISTER', target: user.email },
      });

      return res.status(201).json({ message: 'Registration successful. Please log in.' });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- LOGIN ----------
// Security controls implemented here:
// 1. Rate limiting (loginLimiter middleware — max 5 attempts / 15 min)
// 2. bcrypt.compare for timing-safe password verification
// 3. JWT signed with HS256, expires in 1 hour
// 4. Response never reveals whether email or password was wrong (prevents enumeration)
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Invalid credentials.'),
    body('password').notEmpty().withMessage('Invalid credentials.'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      // Use bcrypt.compare even if user doesn't exist to prevent timing attacks
      const fakeHash = '$2b$12$invalidhashfortimingnormalization00000000000000000000000';
      const passwordMatch = await bcrypt.compare(
        password,
        user ? user.passwordHash : fakeHash
      );

      if (!user || !passwordMatch) {
        // Log failed attempt for security dashboard
        await prisma.failedLogin.create({
          data: {
            email: email,
            ipAddress: getClientIp(req),
          },
        });
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      // Check if 2FA is enabled for this user
      if (user.twoFactorEnabled) {
        // Issue a short-lived temp token — only valid for the 2FA verification step
        const tempToken = jwt.sign(
          { userId: user.id, email: user.email, requires2FA: true },
          process.env.JWT_SECRET,
          { expiresIn: '5m' }
        );
        return res.json({ requires2FA: true, tempToken });
      }

      // No 2FA — issue the full token as normal
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h', algorithm: 'HS256' }
      );

      await prisma.auditLog.create({
        data: { userId: user.id, action: 'LOGIN', target: user.email },
      });

      const admin = await isUserAdmin(prisma, user);

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          twoFactorEnabled: user.twoFactorEnabled,
          isAdmin: admin,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- LOGOUT ----------
// JWT is stateless — logout is handled on the client by discarding the token.
// This endpoint exists for audit logging purposes.
router.post('/logout', async (req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
