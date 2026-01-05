#!/usr/bin/env node
/*
  Backfill specialized role tables (Student, Admin, Staff, Warden) from existing User rows.
  Usage:
    node scripts/backfillRoleTables.js            # executes backfill
    DRY_RUN=1 node scripts/backfillRoleTables.js  # shows planned actions only

  Notes:
    - Assumes prisma schema already migrated with specialized tables.
    - Safe to run multiple times; it skips users already backfilled.
    - Generates fallback employee/enrollment IDs where missing.
*/

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const dryRun = process.env.DRY_RUN === '1';
  const specializedTypes = ['STUDENT','ADMIN','STAFF','WARDEN'];
  const users = await prisma.user.findMany({
    where: { userType: { in: specializedTypes } },
    orderBy: { createdAt: 'asc' }
  });

  let actions = [];

  for (const user of users) {
    const { id: userId, universityId, userType } = user;

    if (userType === 'STUDENT') {
      const existing = await prisma.student.findFirst({ where: { userId } });
      if (!existing) {
        actions.push({ type: 'STUDENT', userId });
        if (!dryRun) {
          await prisma.student.create({
            data: {
              userId,
              universityId,
              enrollmentNo: user.studentId || `ENR-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              program: user.program || null,
              gender: user.gender || null
            }
          });
        }
      }
    } else if (userType === 'ADMIN') {
      const existing = await prisma.admin.findFirst({ where: { userId } });
      if (!existing) {
        actions.push({ type: 'ADMIN', userId });
        if (!dryRun) {
          await prisma.admin.create({
            data: {
              userId,
              universityId,
              employeeId: user.employeeId || `ADM-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              position: 'Administrator'
            }
          });
        }
      }
    } else if (userType === 'STAFF') {
      const existing = await prisma.staff.findFirst({ where: { userId } });
      if (!existing) {
        actions.push({ type: 'STAFF', userId });
        if (!dryRun) {
          await prisma.staff.create({
            data: {
              userId,
              universityId,
              employeeId: user.employeeId || `STF-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              department: null
            }
          });
        }
      }
    } else if (userType === 'WARDEN') {
      const existing = await prisma.warden.findFirst({ where: { userId } });
      if (!existing) {
        actions.push({ type: 'WARDEN', userId });
        if (!dryRun) {
          await prisma.warden.create({
            data: {
              userId,
              universityId,
              employeeId: user.employeeId || `WRD-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              hostelName: null
            }
          });
        }
      }
    }
  }

  if (dryRun) {
    console.log(`Planned backfill actions (count=${actions.length}):`);
    console.table(actions);
  } else {
    console.log(`Backfill complete. Created ${actions.length} specialized records.`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
