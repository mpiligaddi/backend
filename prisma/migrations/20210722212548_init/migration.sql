/*
  Warnings:

  - You are about to drop the `ChainPeriodReport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChainPeriodReport" DROP CONSTRAINT "ChainPeriodReport_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ChainPeriodReport" DROP CONSTRAINT "ChainPeriodReport_periodId_fkey";

-- DropTable
DROP TABLE "ChainPeriodReport";

-- CreateTable
CREATE TABLE "ClientPeriodReport" (
    "id" TEXT NOT NULL,
    "periodId" TEXT,
    "clientId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientPeriodReport_periodId_unique" ON "ClientPeriodReport"("periodId");

-- AddForeignKey
ALTER TABLE "ClientPeriodReport" ADD FOREIGN KEY ("periodId") REFERENCES "PeriodReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPeriodReport" ADD FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
