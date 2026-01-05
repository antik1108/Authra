// Database connection using Prisma Client
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to Neon PostgreSQL database');
  } catch (error) {
    // Print a concise, safe error message to help debugging without leaking the full DATABASE_URL
    console.error('❌ Failed to connect to database:');
    if (error && error.code) console.error('Error code:', error.code);
    if (error && error.message) console.error('Message:', error.message);
    else console.error(error);
    // Also print a short hint to check DATABASE_URL and network
    console.error('\nHint: verify `authra-backend/.env` DATABASE_URL, network connectivity, and Neon credentials.');
    process.exit(1);
  }
}

// Graceful shutdown on signals
const shutdown = async (signal) => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = { prisma, testConnection };
