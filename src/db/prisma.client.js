
const { PrismaClient } = require('@prisma/client');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');

const prisma = new PrismaClient();

const sessionStore = new PrismaSessionStore(
  prisma, {
  checkPeriod: 2 * 60 * 1000, //ms
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
})

module.exports = { prisma, sessionStore };