const express = require('express');
const router = express.Router();
const otplib = require('otplib');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { isUserAdmin } = require('../utils/authz');
const { getClientIp } = require('../utils/request');

const prisma = new PrismaClient();
const generateSecret = otplib.generateSecret || otplib.default?.generateSecret;
const generateURI = otplib.generateURI || otplib.default?.generateURI;
const verifySync = otplib.verifySync || otplib.default?.verifySync;

// POST /api/auth/2fa/setup
// Generates a new TOTP secret for the logged-in user and returns a QR code.
// The secret is stored but 2FA is NOT yet enabled — user must verify first.
router.post('/setup', authMiddleware, async (req, res, next) => {
  try {
    if (!generateSecret || !generateURI || !verifySync) {
      return res.status(500).json({ error: '2FA library is not initialized correctly on server.' });
    }

    const secret = generateSecret();
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

    const otpAuthUrl = generateURI({
      strategy: 'totp',
      label: user.email,
      issuer: 'CampusTrade',
      secret,
      digits: 6,
      period: 30,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    // Store secret temporarily — not active until verified
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    });

    res.json({ qrCode: qrCodeDataUrl, secret });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/2fa/verify-setup
// User submits the code from their authenticator to confirm setup works.
// Only after this succeeds is 2FA actually enabled on the account.
router.post('/verify-setup', authMiddleware, async (req, res, next) => {
  try {
    const code = String(req.body?.code || '').replace(/\s+/g, '');
    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'A valid 6-digit code is required.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: 'Please initiate 2FA setup first.' });
    }

    const verifyResult = verifySync({
      strategy: 'totp',
      secret: user.twoFactorSecret,
      token: code,
      digits: 6,
      period: 30,
      // allow one 30-second step before/after to tolerate small clock drift
      epochTolerance: 30,
    });
    const isValid = !!verifyResult?.valid;
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid code. Please check your authenticator app and try again.' });
    }

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { twoFactorEnabled: true },
    });

    await prisma.auditLog.create({
      data: { userId: req.user.userId, action: '2FA_ENABLED', target: user.email },
    });

    res.json({ message: '2FA successfully enabled on your account.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/2fa/login
// Second step of login for 2FA users.
// Accepts a tempToken (short-lived JWT) + a TOTP code.
// Returns the real full-access JWT if both are valid.
router.post('/login', async (req, res, next) => {
  try {
    const code = String(req.body?.code || '').replace(/\s+/g, '');
    const tempToken = req.body?.tempToken;
    if (!code || !tempToken || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Code and token are required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    if (!decoded.requires2FA) {
      return res.status(400).json({ error: 'Invalid token type.' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA is not configured for this account.' });
    }

    const verifyResult = verifySync({
      strategy: 'totp',
      secret: user.twoFactorSecret,
      token: code,
      digits: 6,
      period: 30,
      epochTolerance: 30,
    });
    const isValid = !!verifyResult?.valid;
    if (!isValid) {
      // Log failed 2FA attempt
      await prisma.failedLogin.create({
        data: { email: user.email, ipAddress: getClientIp(req) },
      });
      return res.status(401).json({ error: 'Invalid authenticator code.' });
    }

    // Issue the real full-access JWT
    const fullToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h', algorithm: 'HS256' }
    );

    await prisma.auditLog.create({
      data: { userId: user.id, action: '2FA_LOGIN_SUCCESS', target: user.email },
    });

    const admin = await isUserAdmin(prisma, user);

    res.json({
      token: fullToken,
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
});

// POST /api/auth/2fa/disable
// Allows a user to turn off 2FA (requires current password confirmation).
router.post('/disable', authMiddleware, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    
    // Check if req.user.email is available, if not fetch user
    let userEmail = req.user.email;
    if (!userEmail) {
      const u = await prisma.user.findUnique({ where: { id: req.user.userId } });
      userEmail = u.email;
    }

    await prisma.auditLog.create({
      data: { userId: req.user.userId, action: '2FA_DISABLED', target: userEmail },
    });
    res.json({ message: '2FA has been disabled.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
