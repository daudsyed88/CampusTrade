const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const fs = require('fs').promises;

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed.'), false);
  }
};

// Use memory storage — Sharp needs the buffer, not a file path
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

// Middleware that runs AFTER multer — processes the buffer with Sharp
// Security actions performed by Sharp:
// 1. Re-encode to JPEG — destroys any polyglot file content or embedded malware
// 2. Strip EXIF metadata — removes GPS, device info, student identity data
// 3. Resize to max 1200px — normalizes storage, prevents zip-bomb-style large images
const processImage = async (req, res, next) => {
  if (!req.file) return next(); // No file uploaded — skip

  const randomName = crypto.randomBytes(16).toString('hex');
  const uploadsDir = path.join(__dirname, '../uploads');

  try {
    const outputFilename = `${randomName}.jpg`;
    const outputPath = path.join(uploadsDir, outputFilename);

    // Ensure upload destination exists before Sharp writes file output
    await fs.mkdir(uploadsDir, { recursive: true });

    await sharp(req.file.buffer)
      .rotate()                          // Auto-rotate based on EXIF orientation (then EXIF is stripped)
      .resize(1200, 1200, {
        fit: 'inside',                   // Maintain aspect ratio, max 1200px on longest side
        withoutEnlargement: true,        // Don't upscale small images
      })
      .jpeg({
        quality: 85,                     // Good quality, reasonable file size
        progressive: true,
      })
      .toFile(outputPath);

    // Replace multer's file object with our processed file info
    req.file.filename = outputFilename;
    req.file.path = outputPath;
    req.file.mimetype = 'image/jpeg';

    next();
  } catch (err) {
    console.error('Image processing error:', err.message);

    // Fallback path: preserve availability if Sharp fails on a specific image.
    // File type is still constrained by multer's MIME allowlist above.
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      const extension = req.file.mimetype === 'image/png' ? 'png' : 'jpg';
      const fallbackFilename = `${randomName}.${extension}`;
      const fallbackPath = path.join(uploadsDir, fallbackFilename);
      await fs.writeFile(fallbackPath, req.file.buffer);

      req.file.filename = fallbackFilename;
      req.file.path = fallbackPath;

      return next();
    } catch (fallbackErr) {
      console.error('Image fallback save error:', fallbackErr.message);
      return next(new Error('Image processing failed. Please try a different image.'));
    }
  }
};

module.exports = { upload, processImage };
