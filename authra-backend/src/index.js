require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { testConnection, prisma } = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const parcelRoutes = require('./routes/parcels');
const studentRoutes = require('./routes/students');

const app = express();
// Use PORT from env if provided; default to 5001 to avoid conflicts with macOS services on 5000
const PORT = process.env.PORT || 5001;

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

// Minimal, robust CORS for dev and production (works with Express 5)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  // Always set these so preflight checks pass
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded parcel images statically
app.use('/uploads/parcels', express.static(path.join(__dirname, '..', 'uploads', 'parcels')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Welcome to Authra API',
    description: 'University Parcel Management System',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      parcels: '/api/parcels/*',
      students: '/api/students/*'
    },
    documentation: 'https://github.com/antik1108/Authra'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Authra Backend API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/students', studentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    // Normalize legacy parcel statuses (ARRIVED -> READY_FOR_PICKUP)
    try {
      const updated = await prisma.parcel.updateMany({
        where: { status: 'ARRIVED' },
        data: { status: 'READY_FOR_PICKUP' }
      });
      if (updated.count > 0) {
        console.log(`🔄 Normalized ${updated.count} legacy parcels to READY_FOR_PICKUP`);
      }
    } catch (e) {
      console.warn('Parcel status normalization skipped:', e.message);
    }
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 Authra Backend API Server Running       ║
║                                               ║
║   Port: ${PORT}                                  ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
║   Database: Neon PostgreSQL (Connected ✅)   ║
║                                               ║
║   Endpoints:                                  ║
║   - GET  /health                              ║
║   - POST /api/auth/register-university        ║
║   - GET  /api/auth/universities              ║
║   - POST /api/auth/login-university           ║
║   - POST /api/auth/register-user              ║
║   - POST /api/auth/login-user                 ║
║   - POST /api/parcels                         ║
║   - GET  /api/parcels                         ║
║   - GET  /api/parcels/track/:trackingNumber   ║
║   - GET  /api/parcels/my-parcels              ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
