const express = require('express');
const { prisma } = require('../db');
const { requireStaff } = require('../middleware/auth');

const router = express.Router();

// Suggest students by partial query (name, enrollment, phone)
router.get('/suggest', requireStaff, async (req, res) => {
  try {
    const { query = '' } = req.query;
    if (!query || query.length < 2) {
      return res.json({ results: [] });
    }

    // Search Users with STUDENT type within staff's university
    const universityId = req.user.universityId;

    const users = await prisma.user.findMany({
      where: {
        universityId,
        userType: 'STUDENT',
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query, mode: 'insensitive' } },
          { studentId: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        studentId: true
      },
      take: 10
    });

    const results = users.map(u => ({
      userId: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      email: u.email,
      phoneNumber: u.phoneNumber || null,
      studentId: u.studentId || null
    }));

    res.json({ results });
  } catch (error) {
    console.error('Student suggest error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

module.exports = router;
