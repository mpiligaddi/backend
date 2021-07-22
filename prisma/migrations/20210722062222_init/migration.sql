/*
  Warnings:

  - You are about to drop the `_CategoryToClient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChainToPeriodReport` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Chain` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[displayName]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cuit]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ReportType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[alias]` on the table `ReportType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Zone` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToClient" DROP CONSTRAINT "_CategoryToClient_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToClient" DROP CONSTRAINT "_CategoryToClient_B_fkey";

-- DropForeignKey
ALTER TABLE "_ChainToPeriodReport" DROP CONSTRAINT "_ChainToPeriodReport_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChainToPeriodReport" DROP CONSTRAINT "_ChainToPeriodReport_B_fkey";

-- AlterTable
ALTER TABLE "Chain" ADD COLUMN     "periodsId" TEXT;

-- AlterTable
ALTER TABLE "PeriodReport" ADD COLUMN     "chainsId" TEXT;

-- DropTable
DROP TABLE "_CategoryToClient";

-- DropTable
DROP TABLE "_ChainToPeriodReport";

-- CreateTable
CREATE TABLE "ClientCategory" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "categoryId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChainPeriodReport" (
    "id" TEXT NOT NULL,
    "periodId" TEXT,
    "chainId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChainPeriodReport_periodId_unique" ON "ChainPeriodReport"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "ChainPeriodReport_chainId_unique" ON "ChainPeriodReport"("chainId");

-- CreateIndex
CREATE UNIQUE INDEX "Branch.name_unique" ON "Branch"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category.name_unique" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Chain.name_unique" ON "Chain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Client.displayName_unique" ON "Client"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "Client.name_unique" ON "Client"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Client.cuit_unique" ON "Client"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "Product.name_unique" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ReportType.name_unique" ON "ReportType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ReportType.alias_unique" ON "ReportType"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "Zone.name_unique" ON "Zone"("name");

-- AddForeignKey
ALTER TABLE "ClientCategory" ADD FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCategory" ADD FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChainPeriodReport" ADD FOREIGN KEY ("periodId") REFERENCES "PeriodReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChainPeriodReport" ADD FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE SET NULL ON UPDATE CASCADE;
