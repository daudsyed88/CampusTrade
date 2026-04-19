const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { upload, processImage } = require('../middleware/upload');

const prisma = new PrismaClient();

// ---------- GET ALL ACTIVE LISTINGS (public) ----------
router.get('/', async (req, res, next) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { isActive: true },
      // Explicit field whitelist — NEVER return passwordHash to client
      // This is the Information Disclosure (STRIDE) countermeasure.
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        category: true,
        imageUrl: true,
        createdAt: true,
        owner: {
          select: { displayName: true, id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(listings);
  } catch (err) {
    next(err);
  }
});

// ---------- GET MY LISTINGS (protected) ----------
router.get('/my/listings', authMiddleware, async (req, res, next) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { ownerId: req.user.userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(listings);
  } catch (err) {
    next(err);
  }
});

// ---------- GET SINGLE LISTING (public) ----------
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, title: true, description: true, price: true,
        category: true, imageUrl: true, createdAt: true,
        owner: { select: { displayName: true, id: true, email: true } },
      },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    res.json(listing);
  } catch (err) {
    next(err);
  }
});

// ---------- CREATE LISTING (protected) ----------
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  processImage,
  [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters.'),
    body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10–2000 characters.'),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be a positive number.'),
    body('category').trim().isLength({ min: 2, max: 50 }).withMessage('Category is required.'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const listing = await prisma.listing.create({
        data: {
          title,
          description,
          price: parseFloat(price),
          category,
          imageUrl,
          ownerId: req.user.userId,
        },
      });

      await prisma.auditLog.create({
        data: { userId: req.user.userId, action: 'CREATE_LISTING', target: listing.id },
      });

      res.status(201).json(listing);
    } catch (err) {
      next(err);
    }
  }
);

// ---------- UPDATE LISTING (protected + ownership check) ----------
// This is the Broken Access Control countermeasure.
// The server re-queries the DB to verify ownership — client-side data is never trusted.
router.patch(
  '/:id',
  authMiddleware,
  [
    body('title').optional().trim().isLength({ min: 3, max: 100 }),
    body('description').optional().trim().isLength({ min: 10, max: 2000 }),
    body('price').optional().isFloat({ min: 0.01 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
      if (!listing) return res.status(404).json({ error: 'Listing not found.' });

      // OWNERSHIP CHECK — this is the critical security gate
      if (listing.ownerId !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this listing.' });
      }

      const { title, description, price } = req.body;
      const updated = await prisma.listing.update({
        where: { id: req.params.id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(price && { price: parseFloat(price) }),
        },
      });

      await prisma.auditLog.create({
        data: { userId: req.user.userId, action: 'UPDATE_LISTING', target: listing.id },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// ---------- DELETE LISTING (protected + ownership check) ----------
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    // OWNERSHIP CHECK
    if (listing.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this listing.' });
    }

    // Soft delete — set isActive to false instead of physically deleting
    // Preserves audit trail for repudiation defense (STRIDE)
    await prisma.listing.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: { userId: req.user.userId, action: 'DELETE_LISTING', target: listing.id },
    });

    res.json({ message: 'Listing removed.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
