const express = require('express');
const bcrypt = require('bcryptjs');
const { prisma } = require('../db');
const {
  generateUserToken,
  generateUniversityToken,
  authenticateToken
} = require('../middleware/auth');

const router = express.Router();
const { requireStaff } = require('../middleware/auth');

// Register University
// List Registered Universities (public minimal list)
router.get('/universities', async (req, res) => {
  try {
    const universities = await prisma.university.findMany({
      select: {
        id: true,
        universityName: true,
        adminEmail: true,
        isVerified: true
      },
      orderBy: { universityName: 'asc' }
    });
    res.json(universities);
  } catch (error) {
    console.error('List universities error:', error);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
});

// Cleanup old read notifications for a user (default older than 30 days)
router.post('/notifications/cleanup', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.body.days || '30', 10);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const del = await prisma.notification.deleteMany({
      where: {
        userId: req.user.id,
        isRead: true,
        createdAt: { lt: cutoff }
      }
    });
    res.json({ message: 'Old notifications cleaned', removed: del.count });
  } catch (e) {
    console.error('Notifications cleanup error:', e);
    res.status(500).json({ error: 'Failed to cleanup notifications' });
  }
});

// Register University
router.post('/register-university', async (req, res) => {
  try {
    const {
      universityName,
      institutionType,
      website,
      establishedYear,
      numberOfStudents,
      accreditationInfo,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      zipCode,
      adminName,
      adminPosition,
      adminEmail,
      contactNumber,
      supportContact,
      adminPassword,
      logoUrl,
      proofOfInstitutionUrl
    } = req.body;

    // Check if university already exists
    const existingUniversity = await prisma.university.findUnique({
      where: { adminEmail }
    });

    if (existingUniversity) {
      return res.status(400).json({ error: 'University with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create university
    const university = await prisma.university.create({
      data: {
        universityName,
        institutionType,
        website,
        establishedYear: establishedYear ? parseInt(establishedYear) : null,
        numberOfStudents: numberOfStudents ? parseInt(numberOfStudents) : null,
        accreditationInfo,
        logoUrl,
        proofOfInstitutionUrl,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        zipCode,
        adminName,
        adminPosition,
        adminEmail,
        contactNumber,
        supportContact,
        passwordHash
      }
    });

    // Generate token
    const token = generateUniversityToken(university.id);

    res.status(201).json({
      message: 'University registered successfully',
      university: {
        id: university.id,
        universityName: university.universityName,
        adminEmail: university.adminEmail
      },
      token
    });
  } catch (error) {
    console.error('University registration error:', error);
    res.status(500).json({ error: 'Failed to register university' });
  }
});

// Login University
router.post('/login-university', async (req, res) => {
  try {
    const { email, password } = req.body;

    const university = await prisma.university.findUnique({
      where: { adminEmail: email }
    });

    if (!university) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, university.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!university.isActive) {
      return res.status(403).json({ error: 'University account is inactive' });
    }

    const token = generateUniversityToken(university.id);

    res.json({
      message: 'Login successful',
      university: {
        id: university.id,
        universityName: university.universityName,
        adminEmail: university.adminEmail,
        isVerified: university.isVerified
      },
      token
    });
  } catch (error) {
    console.error('University login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// University dashboard / profile summary (auth required)
router.get('/me-university', require('../middleware/auth').authenticateUniversity, async (req, res) => {
  try {
    const university = req.university;

    // Parcel counts by status (Arrived / Picked Up minimal set)
    const [arrivedCount, pickedCount, totalParcels] = await Promise.all([
      prisma.parcel.count({ where: { universityId: university.id, status: 'ARRIVED' } }),
      prisma.parcel.count({ where: { universityId: university.id, status: 'PICKED_UP' } }),
      prisma.parcel.count({ where: { universityId: university.id } })
    ]);

    res.json({
      university: {
        id: university.id,
        universityName: university.universityName,
        institutionType: university.institutionType,
        website: university.website,
        establishedYear: university.establishedYear,
        numberOfStudents: university.numberOfStudents,
        accreditationInfo: university.accreditationInfo,
        addressLine1: university.addressLine1,
        addressLine2: university.addressLine2,
        city: university.city,
        state: university.state,
        country: university.country,
        zipCode: university.zipCode,
        adminName: university.adminName,
        adminPosition: university.adminPosition,
        adminEmail: university.adminEmail,
        contactNumber: university.contactNumber,
        supportContact: university.supportContact,
        isVerified: university.isVerified,
        createdAt: university.createdAt
      },
      stats: {
        total: totalParcels,
        arrived: arrivedCount,
        picked: pickedCount
      }
    });
  } catch (error) {
    console.error('University me endpoint error:', error);
    res.status(500).json({ error: 'Failed to load university data' });
  }
});

// University staff listing (ADMIN/WARDEN/STAFF) excluding students
router.get('/university-staff', require('../middleware/auth').authenticateUniversity, async (req, res) => {
  try {
    const universityId = req.university.id;

    const [admins, wardens, staffMembers] = await Promise.all([
      prisma.admin.findMany({
        where: { universityId },
        include: { user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true, createdAt: true } } },
        orderBy: { employeeId: 'asc' }
      }),
      prisma.warden.findMany({
        where: { universityId },
        include: { user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true, createdAt: true } } },
        orderBy: { employeeId: 'asc' }
      }),
      prisma.staff.findMany({
        where: { universityId },
        include: { user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true, createdAt: true } } },
        orderBy: { employeeId: 'asc' }
      })
    ]);

    const mapRecord = (r, role, extra = {}) => ({
      id: r.userId,
      firstName: r.user.firstName,
      lastName: r.user.lastName,
      email: r.user.email,
      phoneNumber: r.user.phoneNumber,
      userType: role,
      employeeId: r.employeeId,
      createdAt: r.user.createdAt,
      ...extra
    });

    const grouped = {
      ADMIN: admins.map(a => mapRecord(a, 'ADMIN', { position: a.position })),
      WARDEN: wardens.map(w => mapRecord(w, 'WARDEN', { hostelName: w.hostelName })),
      STAFF: staffMembers.map(s => mapRecord(s, 'STAFF', { department: s.department }))
    };

    res.json({
      staff: grouped,
      counts: Object.fromEntries(Object.entries(grouped).map(([k,v]) => [k, v.length]))
    });
  } catch (error) {
    console.error('University staff listing error:', error);
    res.status(500).json({ error: 'Failed to fetch staff list' });
  }
});

// Notifications for university (admin) or user depending on token type
router.get('/notifications', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    const { JWT_SECRET } = require('../middleware/auth');
    const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);

    let notifications = [];
    if (decoded.userId) {
      notifications = await prisma.notification.findMany({
        where: { userId: decoded.userId },
        orderBy: { createdAt: 'desc' },
        take: 25
      });
    } else if (decoded.universityId) {
      notifications = await prisma.notification.findMany({
        where: { universityId: decoded.universityId },
        orderBy: { createdAt: 'desc' },
        take: 25
      });
    } else {
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    const unread = notifications.filter(n => !n.isRead).length;
    res.json({ notifications, unread });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark all notifications as read for current token context (user or university)
router.post('/notifications/mark-read', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    const { JWT_SECRET } = require('../middleware/auth');
    const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);

    let updateResult;
    if (decoded.userId) {
      updateResult = await prisma.notification.updateMany({
        where: { userId: decoded.userId, isRead: false },
        data: { isRead: true }
      });
    } else if (decoded.universityId) {
      updateResult = await prisma.notification.updateMany({
        where: { universityId: decoded.universityId, isRead: false },
        data: { isRead: true }
      });
    } else {
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    res.json({ success: true, updated: updateResult.count, unread: 0, updatedIds: updateResult.count > 0 ? 'BULK' : [] });
  } catch (error) {
    console.error('Mark-read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Mark a single notification as read
router.post('/notifications/:id/read', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });
    const { JWT_SECRET } = require('../middleware/auth');
    const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);

    const { id } = req.params;
    // Ensure the notification belongs to user or university in token
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    if (!( (decoded.userId && notif.userId === decoded.userId) || (decoded.universityId && notif.universityId === decoded.universityId) )) {
      return res.status(403).json({ error: 'Not authorized to modify this notification' });
    }

    if (notif.isRead) {
      return res.json({ success: true, alreadyRead: true });
    }

    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    res.json({ success: true, id, unreadDecrement: 1 });
  } catch (error) {
    console.error('Single mark-read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Register Individual User (Student/Faculty)
router.post('/register-user', async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      studentId,       // enrollment number for students
      employeeId,      // employee/warden/staff id
      userType,
      universityId,
      program,
      position,        // admin position
      department,      // staff department
      hostelName,      // warden hostel name
      gender
    } = req.body;

    if (!universityId) return res.status(400).json({ error: 'University ID is required' });
    if (!userType) return res.status(400).json({ error: 'User type is required' });

    // Verify university exists
    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university) return res.status(404).json({ error: 'University not found' });

    // Enforce scoped unique email within university
    const existingSameEmail = await prisma.user.findFirst({
      where: { email, universityId }
    });
    if (existingSameEmail) {
      return res.status(400).json({ error: 'Email already in use for this university' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Base user creation (should be inside a transaction with role record; simplified here)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phoneNumber,
        studentId,    // kept for backward compatibility; specialized table also stores enrollment
        employeeId,   // kept for backward compatibility
        userType,
        universityId,
        program,
        gender: gender || null
      },
      include: {
        university: { select: { id: true, universityName: true } }
      }
    });

    // Create specialized role record
    try {
      switch (userType) {
        case 'STUDENT':
          if (!studentId) return res.status(400).json({ error: 'enrollmentNo (studentId) required for student' });
          await prisma.student.create({
            data: {
              userId: user.id,
              universityId,
              enrollmentNo: studentId,
              program: program || null,
              gender: gender || null
            }
          });
          break;
        case 'ADMIN':
          await prisma.admin.create({
            data: {
              userId: user.id,
              universityId,
              employeeId: employeeId || `ADM-${Date.now()}`,
              position: position || 'Administrator'
            }
          });
          break;
        case 'STAFF':
          await prisma.staff.create({
            data: {
              userId: user.id,
              universityId,
              employeeId: employeeId || `STF-${Date.now()}`,
              department: department || null
            }
          });
          break;
        case 'WARDEN':
          await prisma.warden.create({
            data: {
              userId: user.id,
              universityId,
              employeeId: employeeId || `WRD-${Date.now()}`,
              hostelName: hostelName || null
            }
          });
          break;
        default:
          // FACULTY or others can be handled later
          break;
      }
    } catch (specErr) {
      console.error('Specialized record creation failed, rolling back base user', specErr);
      // In a production system we'd use a transaction; simplified rollback here
      await prisma.user.delete({ where: { id: user.id } });
      return res.status(500).json({ error: 'Failed creating role-specific data' });
    }

    const token = generateUserToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
        program: user.program,
        studentId: user.studentId,
        employeeId: user.employeeId,
        gender: user.gender,
        university: user.university,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login Individual User
router.post('/login-user', async (req, res) => {
  try {
    const { email, password, universityId, userType } = req.body;

    if (!universityId) {
      return res.status(400).json({ error: 'University ID is required' });
    }
    if (!userType) {
      return res.status(400).json({ error: 'User type is required' });
    }

    // Find user constrained by university + userType + email
    const user = await prisma.user.findFirst({
      where: {
        email,
        universityId,
        userType
      },
      include: {
        university: {
          select: {
            id: true,
            universityName: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check approval status
    if (user.approvalStatus === 'PENDING') {
      return res.status(403).json({ 
        error: 'Your account is pending approval',
        needsApproval: true,
        status: 'PENDING'
      });
    }

    if (user.approvalStatus === 'REJECTED') {
      return res.status(403).json({ 
        error: 'Your account has been rejected',
        needsApproval: true,
        status: 'REJECTED'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'User account is inactive' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = generateUserToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        studentId: user.studentId,
        employeeId: user.employeeId,
        program: user.program,
        userType: user.userType,
        university: user.university,
        gender: user.gender,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get pending approvals (for Admin, Warden, University dashboards)
router.get('/pending-approvals', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    const { JWT_SECRET } = require('../middleware/auth');
    const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);

    let pendingUsers = [];

    // University can approve: Admins
    if (decoded.universityId) {
      pendingUsers = await prisma.user.findMany({
        where: {
          universityId: decoded.universityId,
          approvalStatus: 'PENDING',
          userType: 'ADMIN'
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          userType: true,
          employeeId: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' } // oldest first
      });

      // Get position for admins
      const admins = await prisma.admin.findMany({
        where: { userId: { in: pendingUsers.map(u => u.id) } },
        select: { userId: true, position: true }
      });
      const positionMap = Object.fromEntries(admins.map(a => [a.userId, a.position]));
      
      // Format data for frontend
      pendingUsers = pendingUsers.map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        identifier: u.email || u.phoneNumber,
        userType: u.userType,
        employeeId: u.employeeId,
        createdAt: u.createdAt,
        additionalInfo: {
          position: positionMap[u.id] || null
        }
      }));

      return res.json({ pendingUsers, role: 'UNIVERSITY' });
    }

    // Admin or Warden can approve: Students, Staff
    // Admin can also approve: Wardens
    if (decoded.userId) {
      const requester = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { userType: true, universityId: true }
      });

      if (!requester) return res.status(404).json({ error: 'User not found' });

      const { userType: requesterType, universityId } = requester;

      if (requesterType === 'ADMIN') {
        // Admin sees: Students, Staff, Wardens
        pendingUsers = await prisma.user.findMany({
          where: {
            universityId,
            approvalStatus: 'PENDING',
            userType: { in: ['STUDENT', 'STAFF', 'WARDEN'] }
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            userType: true,
            studentId: true,
            employeeId: true,
            program: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        });

        // Get additional details from specialized tables
        const students = await prisma.student.findMany({
          where: { userId: { in: pendingUsers.filter(u => u.userType === 'STUDENT').map(u => u.id) } },
          select: { userId: true, enrollmentNo: true, program: true }
        });
        const staff = await prisma.staff.findMany({
          where: { userId: { in: pendingUsers.filter(u => u.userType === 'STAFF').map(u => u.id) } },
          select: { userId: true, department: true }
        });
        const wardens = await prisma.warden.findMany({
          where: { userId: { in: pendingUsers.filter(u => u.userType === 'WARDEN').map(u => u.id) } },
          select: { userId: true, hostelName: true }
        });

        const studentMap = Object.fromEntries(students.map(s => [s.userId, s]));
        const staffMap = Object.fromEntries(staff.map(s => [s.userId, s]));
        const wardenMap = Object.fromEntries(wardens.map(w => [w.userId, w]));

        // Format data for frontend
        pendingUsers = pendingUsers.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`.trim(),
          identifier: u.email || u.phoneNumber,
          userType: u.userType,
          studentId: u.studentId,
          employeeId: u.employeeId,
          enrollmentNo: studentMap[u.id]?.enrollmentNo,
          createdAt: u.createdAt,
          additionalInfo: {
            program: studentMap[u.id]?.program || u.program,
            department: staffMap[u.id]?.department,
            hostelName: wardenMap[u.id]?.hostelName,
            enrollmentNo: studentMap[u.id]?.enrollmentNo
          }
        }));

        return res.json({ pendingUsers, role: 'ADMIN' });
      }

      if (requesterType === 'WARDEN') {
        // Warden sees: Students, Staff
        pendingUsers = await prisma.user.findMany({
          where: {
            universityId,
            approvalStatus: 'PENDING',
            userType: { in: ['STUDENT', 'STAFF'] }
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            userType: true,
            studentId: true,
            employeeId: true,
            program: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        });

        const students = await prisma.student.findMany({
          where: { userId: { in: pendingUsers.filter(u => u.userType === 'STUDENT').map(u => u.id) } },
          select: { userId: true, enrollmentNo: true, program: true }
        });
        const staff = await prisma.staff.findMany({
          where: { userId: { in: pendingUsers.filter(u => u.userType === 'STAFF').map(u => u.id) } },
          select: { userId: true, department: true }
        });

        const studentMap = Object.fromEntries(students.map(s => [s.userId, s]));
        const staffMap = Object.fromEntries(staff.map(s => [s.userId, s]));

        // Format data for frontend
        pendingUsers = pendingUsers.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`.trim(),
          identifier: u.email || u.phoneNumber,
          userType: u.userType,
          studentId: u.studentId,
          employeeId: u.employeeId,
          enrollmentNo: studentMap[u.id]?.enrollmentNo,
          createdAt: u.createdAt,
          additionalInfo: {
            program: studentMap[u.id]?.program || u.program,
            department: staffMap[u.id]?.department,
            enrollmentNo: studentMap[u.id]?.enrollmentNo
          }
        }));

        return res.json({ pendingUsers, role: 'WARDEN' });
      }

      return res.status(403).json({ error: 'Not authorized to view approvals' });
    }

    return res.status(400).json({ error: 'Invalid token' });
  } catch (error) {
    console.error('Pending approvals error:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
});

// Approve or reject user
router.post('/approve-user', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    const { JWT_SECRET } = require('../middleware/auth');
    const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);

    const { userId, action } = req.body; // action: 'APPROVE' or 'REJECT'

    if (!userId || !action) {
      return res.status(400).json({ error: 'userId and action required' });
    }

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be APPROVE or REJECT' });
    }

    // Get the user to be approved
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true, universityId: true, approvalStatus: true }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.approvalStatus !== 'PENDING') {
      return res.status(400).json({ error: 'User is not pending approval' });
    }

    // Determine approver
    let approverId = null;
    let requesterType = null;

    if (decoded.universityId) {
      // University approving
      requesterType = 'UNIVERSITY';
      approverId = decoded.universityId;
      
      // University can only approve ADMINs
      if (targetUser.userType !== 'ADMIN') {
        return res.status(403).json({ error: 'University can only approve admins' });
      }
    } else if (decoded.userId) {
      const requester = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { userType: true, universityId: true }
      });

      if (!requester) {
        return res.status(404).json({ error: 'Requester not found' });
      }

      requesterType = requester.userType;
      approverId = decoded.userId;

      // Check permissions
      if (requesterType === 'ADMIN') {
        // Admin can approve: STUDENT, STAFF, WARDEN
        if (!['STUDENT', 'STAFF', 'WARDEN'].includes(targetUser.userType)) {
          return res.status(403).json({ error: 'Admin cannot approve this user type' });
        }
      } else if (requesterType === 'WARDEN') {
        // Warden can approve: STUDENT, STAFF
        if (!['STUDENT', 'STAFF'].includes(targetUser.userType)) {
          return res.status(403).json({ error: 'Warden cannot approve this user type' });
        }
      } else {
        return res.status(403).json({ error: 'Not authorized to approve users' });
      }

      // Check same university
      if (requester.universityId !== targetUser.universityId) {
        return res.status(403).json({ error: 'Can only approve users from your university' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid token' });
    }

    // Update user approval status
    const updateData = {
      approvalStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      isApproved: action === 'APPROVE',
      isActive: action === 'APPROVE' // Set active only if approved
    };

    if (action === 'APPROVE') {
      updateData.approvedBy = approverId;
      updateData.approvedAt = new Date();
    } else {
      updateData.rejectedBy = approverId;
      updateData.rejectedAt = new Date();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userType: true,
        approvalStatus: true
      }
    });

    res.json({
      message: `User ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to process approval' });
  }
});

// Self profile endpoint for individual users (used to validate localStorage on refresh)
router.get('/me-user', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const user = req.user; // populated by authenticateToken

    // Attempt to gather role-specific details (non-blocking)
    let extra = {};
    switch (user.userType) {
      case 'STUDENT':
        extra = await prisma.student.findUnique({ where: { userId: user.id }, select: { enrollmentNo: true, program: true, gender: true } }) || {};
        break;
      case 'ADMIN':
        extra = await prisma.admin.findUnique({ where: { userId: user.id }, select: { employeeId: true, position: true } }) || {};
        break;
      case 'STAFF':
        extra = await prisma.staff.findUnique({ where: { userId: user.id }, select: { employeeId: true, department: true } }) || {};
        break;
      case 'WARDEN':
        extra = await prisma.warden.findUnique({ where: { userId: user.id }, select: { employeeId: true, hostelName: true } }) || {};
        break;
      default:
        break;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
        program: user.program || extra.program || null,
        studentId: user.studentId || extra.enrollmentNo || null,
        employeeId: user.employeeId || extra.employeeId || null,
        gender: user.gender || extra.gender || null,
        university: user.university ? { id: user.university.id, universityName: user.university.universityName } : null,
        position: extra.position,
        department: extra.department,
        hostelName: extra.hostelName,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('me-user endpoint error:', error);
    res.status(500).json({ error: 'Failed to load user profile' });
  }
});

module.exports = router;
// --- Added below: user self profile endpoint for refresh validation ---
// (Placed before module.exports in patch; ensure only one export)
