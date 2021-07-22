/*
  Warnings:

  - You are about to drop the column `periodsId` on the `Chain` table. All the data in the column will be lost.
  - You are about to drop the column `chainId` on the `ChainPeriodReport` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChainPeriodReport" DROP CONSTRAINT "ChainPeriodReport_chainId_fkey";

-- DropIndex
DROP INDEX "ChainPeriodReport_chainId_unique";

-- AlterTable
ALTER TABLE "Chain" DROP COLUMN "periodsId";

-- AlterTable
ALTER TABLE "ChainPeriodReport" DROP COLUMN "chainId";
