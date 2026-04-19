const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { isUserAdmin } = require('../utils/authz');

const prisma = new PrismaClient();

const adminCheck = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, email: true },
  });
  const admin = await isUserAdmin(prisma, user);
  if (!admin) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

// GET /api/security/status
// Returns a full security posture summary for the dashboard.
router.get('/status', authMiddleware, adminCheck, async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalListings,
      recentAuditLogs,
      recentFailedLogins,
      failedLoginCount24h,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { isActive: true } }),
      prisma.auditLog.findMany({
        take: 20,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { email: true, displayName: true } } },
      }),
      prisma.failedLogin.findMany({
        take: 20,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.failedLogin.count({
        where: {
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalListings,
        failedLoginCount24h,
      },
      securityControls: [
        { id: 1, name: 'bcrypt Password Hashing',       status: 'ACTIVE', detail: 'saltRounds: 12' },
        { id: 2, name: '.edu Email Enforcement',        status: 'ACTIVE', detail: 'Server-side regex' },
        { id: 3, name: 'Login Rate Limiting',           status: 'ACTIVE', detail: '5 attempts / 15 min' },
        { id: 4, name: 'JWT Authentication',            status: 'ACTIVE', detail: 'HS256, 1hr expiry' },
        { id: 5, name: 'Ownership Authorization',       status: 'ACTIVE', detail: 'DB-level check' },
        { id: 6, name: 'Parameterized Queries (Prisma)',status: 'ACTIVE', detail: 'No raw SQL' },
        { id: 7, name: 'XSS Prevention (DOMPurify)',    status: 'ACTIVE', detail: 'Client-side sanitize' },
        { id: 8, name: 'Helmet Security Headers',       status: 'ACTIVE', detail: '11+ headers set' },
        { id: 9, name: 'MIME-Type File Validation',     status: 'ACTIVE', detail: 'JPEG/PNG only' },
        { id: 10, name: 'Audit Logging',                status: 'ACTIVE', detail: 'All write ops logged' },
        { id: 11, name: 'Anti-Enumeration Messages',    status: 'ACTIVE', detail: 'Generic auth errors' },
        { id: 12, name: 'Payload Size Limiting',        status: 'ACTIVE', detail: 'Max 10KB JSON body' },
      ],
      recentAuditLogs,
      recentFailedLogins,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
