-- AlterEnum
ALTER TYPE "user_role" ADD VALUE 'client';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "picture" TEXT;
