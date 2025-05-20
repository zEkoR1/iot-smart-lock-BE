const { PrismaClient } = require('@prisma/client');

// Create a single instance of Prisma Client to be used throughout the app
const prisma = new PrismaClient();

module.exports = prisma;
