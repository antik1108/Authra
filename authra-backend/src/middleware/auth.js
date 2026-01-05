const jwt = require('jsonwebtoken');
const { prisma } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { university: true }
    });

    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Middleware to verify University admin token
async function authenticateUniversity(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const university = await prisma.university.findUnique({
      where: { id: decoded.universityId }
    });

    if (!university || !university.isActive) {
      return res.status(403).json({ error: 'University not found or inactive' });
    }

    req.university = university;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Generate JWT token for user
function generateUserToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Generate JWT token for university
function generateUniversityToken(universityId) {
  return jwt.sign({ universityId }, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = {
  authenticateToken,
  authenticateUniversity,
  // Require an authenticated, approved Staff user
  requireStaff: async function (req, res, next) {
    try {
      // Ensure token is validated first
      await authenticateToken(req, res, async function () {
        const user = req.user;
        if (user.userType !== 'STAFF') {
          return res.status(403).json({ error: 'Staff access required' });
        }
        if (!user.isApproved || user.approvalStatus !== 'APPROVED') {
          return res.status(403).json({ error: 'Staff approval required' });
        }
        next();
      });
    } catch (e) {
      return res.status(403).json({ error: 'Staff authentication failed' });
    }
  },
  // Require an authenticated approved Student user
  requireStudent: async function (req, res, next) {
    try {
      await authenticateToken(req, res, async function () {
        const user = req.user;
        if (user.userType !== 'STUDENT') {
          return res.status(403).json({ error: 'Student access required' });
        }
        if (!user.isApproved || user.approvalStatus !== 'APPROVED') {
          return res.status(403).json({ error: 'Student approval required' });
        }
        next();
      });
    } catch (e) {
      return res.status(403).json({ error: 'Student authentication failed' });
    }
  },
  generateUserToken,
  generateUniversityToken,
  JWT_SECRET
};
