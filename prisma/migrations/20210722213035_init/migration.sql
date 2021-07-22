/*
  Warnings:

  - You are about to drop the column `chainsId` on the `PeriodReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PeriodReport" DROP COLUMN "chainsId",
ADD COLUMN     "clientId" TEXT;
