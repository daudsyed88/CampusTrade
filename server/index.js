const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');

dotenv.config();
const app = express();
app.set('trust proxy', 1);

// Security headers — keep Helmet defaults, but allow frontend origin
// to render uploaded images served from this backend.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — only allow requests from the React frontend origin
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' })); // body size limit prevents large payload attacks
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serve uploaded images

const securityRoutes = require('./routes/security');
const twoFactorRoutes = require('./routes/twoFactor');

app.use('/api/auth/2fa', twoFactorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/security', securityRoutes);

// Global error handler — must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
