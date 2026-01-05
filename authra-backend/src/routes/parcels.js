const express = require('express');
const { prisma } = require('../db');
const { authenticateUniversity, authenticateToken, requireStaff, requireStudent } = require('../middleware/auth');

// Fallback marker for PLACED status when enum migration not yet applied
const PLACED_FALLBACK_MARKER = '__PLACED__';
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Simple disk storage for parcel photos (can be replaced with S3 later)
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'parcels');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `parcel_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

const router = express.Router();

// Generate unique tracking number
function generateTrackingNumber() {
  const prefix = 'AUTHRA';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Generate pickup code
function generatePickupCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create new parcel (Staff-only, simplified fields + photo)
// Accept multipart/form-data with fields and single file 'photo'
router.post('/', requireStaff, upload.single('photo'), async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      organization,
      orderId,
      note
    } = req.body;

    const photoFile = req.file;
    if (!studentName || (!studentId && !studentName)) {
      return res.status(400).json({ error: 'Student name is required' });
    }
    if (!organization) {
      return res.status(400).json({ error: 'Organization is required' });
    }
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    if (!photoFile) {
      return res.status(400).json({ error: 'Parcel photo is required' });
    }

    const trackingNumber = generateTrackingNumber();
    const pickupCode = generatePickupCode();

    // Staff belongs to a university; scope by staff user's universityId
    const staffUser = req.user;
    const universityId = staffUser.universityId;

    // Try to find receiver user if studentId present
    let receiver = null;
    if (studentId) {
      receiver = await prisma.user.findFirst({
        where: { studentId, universityId }
      });
    }

    const parcel = await prisma.parcel.create({
      data: {
        trackingNumber,
        pickupCode,
        // Use new explicit fields
        senderName: organization || 'Unknown',
        receiverName: studentName,
        receiverEmail: receiver?.email || '',
        receiverPhone: receiver?.phoneNumber || null,
        receiverStudentId: studentId || null,
        receiverId: receiver?.id || null,
        universityId,
        courierService: organization || null,
        weight: null,
        dimensions: null,
        description: null,
        organization: organization || null,
        orderId: orderId || null,
        note: note || null,
        photoUrl: photoFile ? `/uploads/parcels/${photoFile.filename}` : null,
        parcelType: 'PACKAGE',
        // Directly mark as READY_FOR_PICKUP (unify ARRIVED + ready phase)
        status: 'READY_FOR_PICKUP',
        location: 'Mail Room',
        trackingHistory: {
          create: {
            status: 'READY_FOR_PICKUP',
            location: 'Mail Room',
            notes: 'Parcel received and ready for pickup',
            updatedBy: `${staffUser.firstName} ${staffUser.lastName}`.trim() || 'Staff'
          }
        }
      },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create notification for receiver if user exists
    if (receiver) {
      await prisma.notification.create({
        data: {
          userId: receiver.id,
          parcelId: parcel.id,
          type: 'READY_FOR_PICKUP',
          title: 'Parcel Ready for Pickup',
          message: `Your parcel from ${organization || 'Unknown'} is ready for pickup. Tracking: ${trackingNumber}`
        }
      });
    }

    // If no receiver matched, record unregistered student
    if (!receiver && studentName) {
      await prisma.unregisteredStudent.create({
        data: {
          universityId,
          name: studentName
        }
      });
    }

    res.status(201).json({
      message: 'Parcel registered successfully',
      parcel
    });
  } catch (error) {
    console.error('Create parcel error:', error);
    res.status(500).json({ error: error?.message || 'Failed to register parcel' });
  }
});

// Get all parcels for university
router.get('/', authenticateUniversity, async (req, res) => {
  try {
    const { status, search, date, month } = req.query;

    const where = {
      universityId: req.university.id
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { receiverName: { contains: search, mode: 'insensitive' } },
        { receiverEmail: { contains: search, mode: 'insensitive' } },
        { receiverStudentId: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Date filter (YYYY-MM-DD) filters by arrivedAt date
    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      where.arrivedAt = { gte: start, lte: end };
    }

    // Month filter (YYYY-MM)
    if (month) {
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999));
      where.arrivedAt = { gte: start, lte: end };
    }

    const parcels = await prisma.parcel.findMany({
      where,
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ parcels });
  } catch (error) {
    console.error('Get parcels error:', error);
    res.status(500).json({ error: 'Failed to fetch parcels' });
  }
});

// Staff listing of parcels (uses staff user token instead of university token)
router.get('/staff', requireStaff, async (req, res) => {
  try {
    const { status, search } = req.query;
    const universityId = req.user.universityId;

    const where = { universityId };
    // Allow READY_FOR_PICKUP, PLACED, PICKED_UP filtering (ARRIVED merged into READY_FOR_PICKUP)
    if (status && ['READY_FOR_PICKUP', 'PLACED', 'PICKED_UP'].includes(status)) {
      if (status === 'READY_FOR_PICKUP') {
        where.status = { in: ['READY_FOR_PICKUP', 'ARRIVED'] };
      } else if (status === 'PLACED') {
        // Filter parcels that either truly have PLACED or simulate via fallback marker
        where.OR = [
          { status: 'PLACED' },
          { AND: [ { status: { in: ['READY_FOR_PICKUP','ARRIVED'] } }, { note: { contains: PLACED_FALLBACK_MARKER } } ] }
        ];
      } else if (status === 'PICKED_UP') {
        where.status = 'PICKED_UP';
      }
    }
    if (search) {
      where.OR = [
        { receiverName: { contains: search, mode: 'insensitive' } },
        { receiverEmail: { contains: search, mode: 'insensitive' } },
        { receiverPhone: { contains: search, mode: 'insensitive' } },
        { orderId: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } }
      ];
    }

    const parcelsRaw = await prisma.parcel.findMany({
      where,
      select: {
        id: true,
        receiverName: true,
        receiverStudentId: true,
        receiverEmail: true,
        receiverPhone: true,
        organization: true,
        orderId: true,
        note: true,
        photoUrl: true,
        status: true,
        arrivedAt: true
      },
      orderBy: { arrivedAt: 'desc' }
    });

    const parcels = parcelsRaw.map(p => {
      let status = p.status === 'ARRIVED' ? 'READY_FOR_PICKUP' : p.status;
      // If fallback marker present and status still READY_FOR_PICKUP treat as PLACED for UI
      if (status === 'READY_FOR_PICKUP' && p.note && p.note.includes(PLACED_FALLBACK_MARKER)) {
        status = 'PLACED';
      }
      return { ...p, status };
    });

    res.json({ parcels });
  } catch (error) {
    console.error('Staff list parcels error:', error);
    res.status(500).json({ error: 'Failed to fetch parcels' });
  }
});

// Get parcel by tracking number
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const parcel = await prisma.parcel.findUnique({
      where: { trackingNumber },
      include: {
        university: {
          select: {
            universityName: true,
            contactNumber: true
          }
        },
        trackingHistory: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }

    res.json({ parcel });
  } catch (error) {
    console.error('Track parcel error:', error);
    res.status(500).json({ error: 'Failed to track parcel' });
  }
});

// Get user's parcels
router.get('/my-parcels', authenticateToken, async (req, res) => {
  try {
    const parcels = await prisma.parcel.findMany({
      where: {
        receiverId: req.user.id
      },
      include: {
        trackingHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ parcels });
  } catch (error) {
    console.error('Get user parcels error:', error);
    res.status(500).json({ error: 'Failed to fetch parcels' });
  }
});

// Update parcel status
router.patch('/:id/status', authenticateUniversity, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, notes } = req.body;

    const parcel = await prisma.parcel.update({
      where: { id },
      data: {
        status,
        location,
        trackingHistory: {
          create: {
            status,
            location,
            notes,
            updatedBy: req.university.adminName
          }
        }
      },
      include: {
        receiver: true,
        trackingHistory: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    // Create notification
    if (parcel.receiverId && status === 'READY_FOR_PICKUP') {
      await prisma.notification.create({
        data: {
          userId: parcel.receiverId,
          parcelId: parcel.id,
          type: 'READY_FOR_PICKUP',
          title: 'Parcel Ready for Pickup',
          message: `Your parcel (${parcel.trackingNumber}) is ready for pickup. Pickup code: ${parcel.pickupCode}`
        }
      });
    }

    res.json({
      message: 'Parcel status updated',
      parcel
    });
  } catch (error) {
    console.error('Update parcel status error:', error);
    res.status(500).json({ error: 'Failed to update parcel status' });
  }
});

// Mark parcel as picked up
router.post('/:id/pickup', authenticateUniversity, async (req, res) => {
  try {
    const { id } = req.params;
    const { pickupCode, pickedUpBy } = req.body;

    const parcel = await prisma.parcel.findUnique({
      where: { id }
    });

    if (!parcel) {
      return res.status(404).json({ error: 'Parcel not found' });
    }

    if (parcel.pickupCode !== pickupCode) {
      return res.status(400).json({ error: 'Invalid pickup code' });
    }

    if (parcel.isPickedUp) {
      return res.status(400).json({ error: 'Parcel already picked up' });
    }

    const updatedParcel = await prisma.parcel.update({
      where: { id },
      data: {
        status: 'PICKED_UP',
        isPickedUp: true,
        pickedUpAt: new Date(),
        pickedUpBy,
        trackingHistory: {
          create: {
            status: 'PICKED_UP',
            notes: `Picked up by ${pickedUpBy}`,
            updatedBy: req.university.adminName
          }
        }
      }
    });

    // Create notification
    if (updatedParcel.receiverId) {
      await prisma.notification.create({
        data: {
          userId: updatedParcel.receiverId,
          parcelId: updatedParcel.id,
          type: 'PARCEL_PICKED_UP',
          title: 'Parcel Picked Up',
          message: `Your parcel (${updatedParcel.trackingNumber}) has been picked up successfully.`
        }
      });
    }

    res.json({
      message: 'Parcel marked as picked up',
      parcel: updatedParcel
    });
  } catch (error) {
    console.error('Pickup parcel error:', error);
    res.status(500).json({ error: 'Failed to process pickup' });
  }
});

// Cleanup old unplaced parcels (Staff-only). Removes parcels older than a threshold that are still READY_FOR_PICKUP/ARRIVED and have not been picked up.
router.post('/cleanup/old', requireStaff, async (req, res) => {
  try {
    // days parameter optional, defaults to 14
    const days = parseInt(req.body.days || '14', 10);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const universityId = req.user.universityId;

    // Find candidate parcels
    const candidates = await prisma.parcel.findMany({
      where: {
        universityId,
        arrivedAt: { lt: cutoff },
        isPickedUp: false,
        status: { in: ['READY_FOR_PICKUP','ARRIVED'] }
      },
      select: { id: true }
    });

    const ids = candidates.map(c => c.id);
    if (ids.length === 0) {
      return res.json({ message: 'No old unplaced parcels to purge', purged: 0 });
    }

    // Delete related notifications first
    await prisma.notification.deleteMany({ where: { parcelId: { in: ids } } });
    const del = await prisma.parcel.deleteMany({ where: { id: { in: ids } } });
    return res.json({ message: 'Old parcels purged', purged: del.count });
  } catch (error) {
    console.error('Cleanup old parcels error:', error);
    res.status(500).json({ error: 'Failed to cleanup old parcels' });
  }
});

module.exports = router;

// Student approval (place order) endpoint appended after exports for clarity; Express still registers earlier middleware
router.post('/:id/place', requireStudent, async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch parcel ensuring it belongs to the student
    const parcel = await prisma.parcel.findUnique({ where: { id } });
    if (!parcel) return res.status(404).json({ error: 'Parcel not found' });
    if (parcel.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized for this parcel' });
    }
    if (parcel.status !== 'READY_FOR_PICKUP' && parcel.status !== 'ARRIVED') {
      return res.status(400).json({ error: 'Parcel not in approvable state' });
    }
    // Update status to PLACED (requires enum migration). If fails, fallback message.
    let updated;
    try {
      updated = await prisma.parcel.update({
        where: { id },
        data: {
          status: 'PLACED',
          trackingHistory: {
            create: {
              status: 'PLACED',
              notes: 'Student confirmed parcel placement for pickup coordination',
              updatedBy: `${req.user.firstName} ${req.user.lastName}`.trim() || 'Student'
            }
          }
        }
      });
    } catch (e) {
      // Fallback: simulate placement by appending marker to note and adding tracking history with READY status
      console.warn('PLACED enum update failed, applying fallback marker:', e.message);
      const appendedNote = parcel.note ? `${parcel.note} ${PLACED_FALLBACK_MARKER}` : PLACED_FALLBACK_MARKER;
      updated = await prisma.parcel.update({
        where: { id },
        data: {
          note: appendedNote,
          trackingHistory: {
            create: {
              status: parcel.status, // keep original enum
              notes: 'Student confirmed placement (fallback).',
              updatedBy: `${req.user.firstName} ${req.user.lastName}`.trim() || 'Student'
            }
          }
        }
      });
      return res.json({ message: 'Parcel placed (fallback)', parcel: updated, fallbackPlaced: true });
    }

    // Optional: notify staff (send READY_FOR_PICKUP again or system alert). Skipped to avoid enum changes.
    return res.json({ message: 'Parcel placed successfully', parcel: updated });
  } catch (error) {
    console.error('Student place parcel error:', error);
    res.status(500).json({ error: 'Failed to place parcel' });
  }
});
