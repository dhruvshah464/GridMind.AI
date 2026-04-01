const { PrismaClient } = require('@prisma/client');

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['warn', 'error']
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['warn', 'error']
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
